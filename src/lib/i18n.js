const fs = require('fs');
const path = require('path');
const onesky = require('onesky-utils');

const config = require(path.resolve('kubozer.conf'));
const configLocal = require(path.resolve('kubozer.conf.local'));

export default class OneSky {
  constructor(secret, apiKey, projectId) {
    this.baseOptions = {
      secret: secret,
      apiKey: apiKey,
      projectId: projectId
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

    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        throw new Error(err);
      }

      oneSkyAppOptions.content = data;
      oneSkyAppOptions.format = config.i18n.format;
      const options = Object.assign({}, this.baseOptions, {
        language: language,
        fileName: this.getFileName(language),
        keepStrings: false,
        content: data,
        format: config.i18n.format
      });
      onesky.postFile(options).then(content => {
        console.info(JSON.stringify(JSON.parse(content), null, 2));
      }).catch(error => {
        console.error(error);
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
