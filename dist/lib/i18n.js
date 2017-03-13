'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var path = require('path');
var onesky = require('onesky-utils');

var OneSky = function () {
  function OneSky(config) {
    _classCallCheck(this, OneSky);

    this._checkForRequired(config);
    this.baseOptions = {
      secret: config.i18n.secret,
      apiKey: config.i18n.apiKey,
      projectId: config.i18n.projectId
    };
  }

  _createClass(OneSky, [{
    key: 'getFilePath',
    value: function getFilePath(languagesPath, language) {
      path.join(languagesPath, language + '.json');
    }
  }, {
    key: 'getFileName',
    value: function getFileName(language) {
      return language + '.json';
    }
  }, {
    key: 'parseLanguages',
    value: function parseLanguages(languagesString) {
      return languages.split(',');
    }
  }, {
    key: 'upload',
    value: function upload(language) {
      var _this = this;

      var filePath = this.getFilePath(config.i18n.languagesPath, language);

      return new Promise(function (resolve, reject) {
        fs.readFile(filePath, 'utf-8', function (err, data) {
          if (err) {
            return reject(err);
          }

          var options = Object.assign({}, _this.baseOptions, {
            language: language,
            fileName: _this.getFileName(language),
            keepStrings: false,
            content: data,
            format: config.i18n.format
          });
          onesky.postFile(options).then(function (content) {
            return resolve(content);
          }).catch(function (error) {
            return reject(error);
          });
        });
      });
    }
  }, {
    key: 'download',
    value: function download(languages) {
      var _this2 = this;

      var langs = this.parseLanguages(languages);

      return new Promise(function (resolve, reject) {
        langs.forEach(function (language) {
          var options = Object.assign({}, _this2.options, {
            language: language,
            fileName: 'EN.json'
          });

          onesky.getFile(options).then(function (content) {
            var filePath = _this2.getFilePath(config.i18n.languagesPath, language);

            fs.writeFile(filePath, content, function (err) {
              if (err) {
                return reject(err);
              }

              return resolve(content);
            });
          }).catch(function (error) {
            return reject(error);
          });
        });
      });
    }
  }, {
    key: '_pathErrHandler',
    value: function _pathErrHandler(entity) {
      var err = new Error();
      var msg = 'Path must be a string. Received undefined';
      err.message = msg + ' --> ' + entity;
      return err;
    }
  }, {
    key: '_checkConfigurationKey',
    value: function _checkConfigurationKey(config, key) {
      if (config.i18n && !config.i18n[key]) {
        throw this._pathErrHandler('config.i18n.' + key);
      }
    }
  }, {
    key: '_checkForRequired',
    value: function _checkForRequired(config) {
      var _this3 = this;

      if (!config.i18n) {
        throw new Error('In order to use OneSky integration, you need i18n configuration');
      }

      var configurationKeys = ['secret', 'apiKey', 'projectId', 'defaultLanguage', 'format', 'oneskyProjectID', 'languagesPath'];
      configurationKeys.forEach(function (key) {
        return _this3._checkConfigurationKey(config, key);
      });
    }
  }]);

  return OneSky;
}();

exports.default = OneSky;