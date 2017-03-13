const fs = require('fs');
const path = require('path');
const onesky = require('onesky-utils');

const config = require(path.resolve('kubozer.conf'));
const configLocal = require(path.resolve('kubozer.conf.local'));

export default class OneSky {
  constructor(config) {
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
          reject(err);
        }

        const options = Object.assign({}, this.baseOptions, {
          language: language,
          fileName: this.getFileName(language),
          keepStrings: false,
          content: data,
          format: config.i18n.format
        });
        onesky.postFile(options).then(content => {
          resolve(content);
        }).catch(error => {
          reject(error);
        });
      });
    });
  }

  download(languages) {
    const langs = this.parseLanguages(languages);

    langs.forEach(language => {
      const options = Object.assign({}, this.options, {
        language: language,
        fileName: 'EN.json'
      });

      onesky.getFile(options).then(content => {
        const filePath = this.getFilePath(config.i18n.languagesPath, language);

        fs.writeFile(filePath, content, err => {
          if(err) {
            console.error(err);
            return;
          }
          console.info(language + ' translation succesfully downloaded');
        });
      }).catch(error => {
        console.error(error.message);
      });
    });
  };
}
