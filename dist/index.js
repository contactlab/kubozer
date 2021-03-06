/**
 * Kubozer - ContactLab build tool.
 * @module index
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _replaceInFile = require('replace-in-file');

var _replaceInFile2 = _interopRequireDefault(_replaceInFile);

var _objOf = require('ramda/src/objOf');

var _objOf2 = _interopRequireDefault(_objOf);

var _result = require('./lib/result');

var _builder = require('./lib/builder');

var _builder2 = _interopRequireDefault(_builder);

var _minifier = require('./lib/minifier');

var _minifier2 = _interopRequireDefault(_minifier);

var _i18n = require('./lib/i18n');

var _i18n2 = _interopRequireDefault(_i18n);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var COPY_COMPLETED = 'Copy completed.';
var COPY_ERROR = 'copy() method was called but "copy" property is empty or undefined.';
var REPLACE_COMPLETED = 'Replace-in-file completed.';

var Kubozer = function () {
  function Kubozer(config, webpackConfig) {
    _classCallCheck(this, Kubozer);

    if (!config || !webpackConfig) {
      throw new Error('Missing configurations.');
    }

    this.config = config;
    this.webpackConfig = webpackConfig;
    this._checkForRequired();

    this.Builder = new _builder2.default(this.config, this.webpackConfig);
    this.Minifier = new _minifier2.default(this.config);

    // Ensure no previous workspaces are present
    this.deleteWorkspace();
  }

  _createClass(Kubozer, [{
    key: 'deleteWorkspace',
    value: function deleteWorkspace() {
      try {
        _fsExtra2.default.removeSync(_path2.default.resolve(this.config.workspace));
      } catch (err) {
        throw new Error(err);
      }
    }
  }, {
    key: 'deletePrevBuild',
    value: function deletePrevBuild() {
      try {
        var pathToBuild = _path2.default.resolve(this.config.buildFolder);
        _fsExtra2.default.removeSync(_path2.default.resolve(pathToBuild));
      } catch (err) {
        throw new Error(err);
      }
    }

    /**
     * {string} type: 'assets' || 'bundles'
     *
     */

  }, {
    key: 'copy',
    value: function copy() {
      var _this = this;

      this._ensureWorkspace();

      return new Promise(function (resolve, reject) {
        if (_this.config.manifest) {
          _this._copyManifest();
        }

        if (_this.config.copy) {
          _this.config.copy.forEach(function (type) {
            type.items.forEach(function (item) {
              try {
                var itemPath = _path2.default.join(_path2.default.resolve(_this.config.workspace), type.baseFolder, item);
                var destination = _path2.default.join(_path2.default.resolve(_this.config.buildFolder), type.baseFolder, item);

                _fsExtra2.default.copySync(itemPath, destination);

                return resolve((0, _result.success)(COPY_COMPLETED, { itemPath: itemPath, destination: destination }));
              } catch (err) {
                return reject(err);
              }
            });
          });
        }

        // If "copy" is empty
        reject((0, _result.error)(COPY_ERROR));
      });
    }
  }, {
    key: 'replace',
    value: function replace() {
      this._ensureWorkspace();

      var optionCSS = {};
      var optionJS = {};

      if (this.config.replace && this.config.replace.css) {
        var cssFiles = this.config.replace.css.files;
        optionCSS.files = _path2.default.join(_path2.default.resolve(this.config.workspace), cssFiles);
        optionCSS.from = this.config.replace.css.commentRegex.map(function (item) {
          return new RegExp(item, 'g');
        });
        optionCSS.to = this.config.replace.css.with.map(function (item) {
          return '\n        <link rel="stylesheet" href="' + item + '" />\n        ';
        });
      }

      if (this.config.replace && this.config.replace.js) {
        optionJS.files = _path2.default.join(_path2.default.resolve(this.config.workspace), this.config.replace.js.files);
        optionJS.from = this.config.replace.js.commentRegex.map(function (item) {
          return new RegExp(item, 'g');
        });
        optionJS.to = this.config.replace.js.with.map(function (item) {
          return '\n        <script src="' + item + '"></script>\n        ';
        });
      }

      if (optionJS.files === undefined && optionCSS.files === undefined) {
        throw new Error('WARNING REPLACE(): replace method called but "files" not found in configuration');
      }

      return new Promise(function (resolve, reject) {
        try {
          var changedCSS = _replaceInFile2.default.sync(optionCSS);
          var changedJS = _replaceInFile2.default.sync(optionJS);

          return resolve((0, _result.success)(REPLACE_COMPLETED, { changedCSS: changedCSS, changedJS: changedJS }));
        } catch (err) {
          reject((0, _result.error)(err));
        }
      });
    }
  }, {
    key: 'build',
    value: function build(minify) {
      var _this2 = this;

      this._ensureWorkspace();

      var intoAs = function intoAs(key, xs) {
        return function (data) {
          return xs.concat((0, _objOf2.default)(key, data));
        };
      };

      return Promise.resolve([]).then(function (result) {
        return _this2.Builder.webpack(minify).then(intoAs('resWebpack', result));
      }).then(function (result) {
        return _this2.Builder.vulcanize().then(intoAs('resVulcanize', result));
      }).then(function (result) {
        return minify ? _this2.Minifier.minifyCSS().then(intoAs('resMinifiedCss', result)) : result;
      }).then(function (result) {
        return minify ? _this2.Builder.hashed().then(intoAs('resHashed', result)) : result;
      }).then(function (result) {
        return result.reduce(function (acc, r) {
          return Object.assign({}, acc, r);
        }, {});
      }).catch(function (err) {
        throw err;
      });
    }
  }, {
    key: 'bump',
    value: function bump(type) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        var types = ['patch', 'minor', 'major', 'prepatch', 'preminor', 'premajor', 'prerelease'];
        var notAType = types.indexOf(type) === -1;

        if (type === null || type === undefined || typeof type !== 'string' || notAType) {
          return reject((0, _result.error)('BUMP(): type must be specified. This is not a valid type --> \'' + type + '\''));
        }

        var oldVersion = '';
        var newVersion = '';

        var dataFiles = _this3.config.bump.files.reduce(function (acc, filePath) {
          var fullFilePath = _path2.default.resolve(filePath);
          var data = JSON.parse(_fsExtra2.default.readFileSync(fullFilePath, 'utf8'));
          var old = data.version;

          data.version = _semver2.default.inc(data.version, type);
          oldVersion = old;
          newVersion = data.version;

          var dataString = JSON.stringify(data, null, 2);

          _fsExtra2.default.writeFileSync(fullFilePath, dataString);

          return acc.concat(data);
        }, []);

        return resolve((0, _result.success)('Bump from ' + oldVersion + ' to ' + newVersion + ' completed.', dataFiles));
      });
    }
  }, {
    key: 'upload',
    value: function upload(language) {
      /* istanbul ignore next */
      var oneSky = new _i18n2.default(this.config);
      /* istanbul ignore next */
      return oneSky.upload(language);
    }
  }, {
    key: 'download',
    value: function download(languages) {
      /* istanbul ignore next */
      var oneSky = new _i18n2.default(this.config);
      /* istanbul ignore next */
      return oneSky.download(languages);
    }
  }, {
    key: '_createWorkspace',
    value: function _createWorkspace() {
      try {
        var pathWorkspace = _path2.default.resolve(this.config.workspace);

        _fsExtra2.default.ensureDirSync(pathWorkspace);
        _fsExtra2.default.copySync(_path2.default.resolve(this.config.sourceFolder), pathWorkspace);
      } catch (err) {
        throw new Error(err);
      }
    }
  }, {
    key: '_ensureWorkspace',
    value: function _ensureWorkspace() {
      if (_fsExtra2.default.existsSync(_path2.default.resolve(this.config.workspace))) {
        return true;
      }

      this._createWorkspace();
    }
  }, {
    key: '_copyManifest',
    value: function _copyManifest() {
      this._ensureWorkspace();

      try {
        var pathManifest = _path2.default.resolve(_path2.default.join(this.config.workspace, 'manifest.json'));
        var pathManifestDist = _path2.default.resolve(_path2.default.join(this.config.buildFolder, 'manifest.json'));
        var exist = _fsExtra2.default.existsSync(pathManifest);

        if (exist) {
          _fsExtra2.default.copySync(pathManifest, pathManifestDist);

          return true;
        }

        return false;
      } catch (err) {
        throw new Error(err);
      }
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
    key: '_checkForRequired',
    value: function _checkForRequired() {
      if (!this.config.workspace || this.config.workspace === '') {
        throw this._pathErrHandler('config.workspace');
      }

      if (!this.config.sourceFolder || this.config.sourceFolder === '') {
        throw this._pathErrHandler('config.sourceFolder');
      }

      if (!this.config.buildFolder || this.config.buildFolder === '') {
        throw this._pathErrHandler('config.buildFolder');
      }

      if (!this.config.buildJS || this.config.buildJS === '') {
        this.config.buildJS = 'bundle.js';
      }

      if (!this.config.copy) {
        this.config.copy = [];
      }
    }
  }]);

  return Kubozer;
}();

exports.default = Kubozer;