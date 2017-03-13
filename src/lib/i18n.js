const fs = require('fs');
const path = require('path');
const onesky = require('onesky-utils');

export default class OneSky {
  constructor(config) {
    this._checkForRequired(config);
    this.baseOptions = {
      secret: config.i18n.secret,
      apiKey: config.i18n.apiKey,
      projectId: config.i18n.projectId
    }
  }

  getFilePath(languagesPath, language) {
    path.join(languagesPath, `${language}.json`);
  }

  getFileName(language) {
    return `${language}.json`;
  }

  parseLanguages(languagesString) {
    return languages.split(',');
  }

  upload(language) {
    const filePath = this.getFilePath(config.i18n.languagesPath, language);

    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          return reject(err);
        }

        const options = Object.assign({}, this.baseOptions, {
          language: language,
          fileName: this.getFileName(language),
          keepStrings: false,
          content: data,
          format: config.i18n.format
        });
        onesky.postFile(options).then(content => {
          return resolve(content);
        }).catch(error => {
          return reject(error);
        });
      });
    });
  }

  download(languages) {
    const langs = this.parseLanguages(languages);

    return new Promise((resolve, reject) => {
      langs.forEach(language => {
        const options = Object.assign({}, this.options, {
          language: language,
          fileName: 'EN.json'
        });

        onesky.getFile(options).then(content => {
          const filePath = this.getFilePath(config.i18n.languagesPath, language);

          fs.writeFile(filePath, content, err => {
            if(err) {
              return reject(err);
            }

            return resolve(content);
          });
        }).catch(error => {
          return reject(error);
        });
      });
    });
  };

  _pathErrHandler(entity) {
		const err = new Error();
		const msg = 'Path must be a string. Received undefined';
		err.message = `${msg} --> ${entity}`;
		return err;
	}

  _checkConfigurationKey(key) {
    if (config.i18n && !config.i18n[key]) {
      throw this._pathErrHandler(`config.i18n.${key}`);
    }
  }

  _checkForRequired(config) {
    if (!config.i18n) {
      throw new Error(
        'In order to use OneSky integration, you need i18n configuration'
      );
    }

    const configurationKeys = [
      'secret',
      'apiKey',
      'projectId',
      'defaultLanguage',
      'format',
      'oneskyProjectID',
      'languagesPath'
    ];
    configurationKeys.forEach(this._checkConfigurationKey);
  }
}
