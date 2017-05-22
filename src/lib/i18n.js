const fs = require('fs');
const path = require('path');
const onesky = require('onesky-utils');

export default class OneSky {
  constructor(config) {
    this._checkForRequired(config);
    this.languagesPath = config.i18n.languagesPath;
    this.format = config.i18n.format;
    this.baseOptions = {
      secret: config.i18n.secret,
      apiKey: config.i18n.apiKey,
      projectId: config.i18n.projectId
    };
  }

  getFilePath(languagesPath, language) {
    return path.join(languagesPath, `${language}.json`);
  }

  getFileName(language) {
    return `${language}.json`;
  }

  upload(language) {
    /* istanbul ignore next */
    const filePath = this.getFilePath(this.languagesPath, language);

    /* istanbul ignore next */
    return new Promise((resolve, reject) => {
      /* istanbul ignore next */
      fs.readFile(filePath, 'utf-8', (err, data) => {
        /* istanbul ignore next */
        if (err) {
          return reject(err);
        }

        /* istanbul ignore next */
        const options = Object.assign({}, this.baseOptions, {
          language,
          fileName: this.getFileName(language),
          keepStrings: false,
          content: data,
          format: this.format
        });
        /* istanbul ignore next */
        onesky.postFile(options).then(content => {
          /* istanbul ignore next */
          return resolve(content);
        }).catch(err => {
          /* istanbul ignore next */
          return reject(err);
        });
      });
    });
  }

  download(language) {
    /* istanbul ignore next */
    return new Promise((resolve, reject) => {
      /* istanbul ignore next */
      const options = Object.assign({}, this.baseOptions, {
        language,
        fileName: 'EN.json'
      });

      /* istanbul ignore next */
      onesky.getFile(options).then(content => {
        /* istanbul ignore next */
        const filePath = this.getFilePath(this.languagesPath, language);

        fs.writeFile(filePath, content, err => {
          /* istanbul ignore next */
          if (err) {
            return reject(err);
          }

          /* istanbul ignore next */
          return resolve(content);
        });
      }).catch(err => {
        /* istanbul ignore next */
        return reject(err);
      });
    });
  }

  _pathErrHandler(entity) {
    const err = new Error();
    const msg = 'Path must be a string. Received undefined';
    err.message = `${msg} --> ${entity}`;
    return err;
  }

  _checkConfigurationKey(config, key) {
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
      'projectId',
      'languagesPath'
    ];
    configurationKeys.forEach(key => this._checkConfigurationKey(config, key));
  }
}
