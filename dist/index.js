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

var _builder = require('./builder');

var _builder2 = _interopRequireDefault(_builder);

var _minifier = require('./minifier');

var _minifier2 = _interopRequireDefault(_minifier);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Kubozer = function () {
	function Kubozer(config, webpackConfig) {
		_classCallCheck(this, Kubozer);

		if (!config || !webpackConfig) {
			throw new Error('Missing configurations.');
		}

		this.config = config;
		this.webpackConfig = webpackConfig;
		this._checkForRequired();

		this.Builder = new _builder2.default(this.config, this.webpackConfig, this._res);
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

				_this.config.copy.forEach(function (type) {
					type.items.forEach(function (item) {
						var itemPath = _path2.default.join(_path2.default.resolve(_this.config.workspace), type.base, item);
						var destination = _path2.default.join(_path2.default.resolve(_this.config.buildFolder), type.base, item);

						try {
							_fsExtra2.default.copySync(itemPath, destination);
							return resolve(_this._res(undefined, { itemPath: itemPath, destination: destination }, 'Copy completed.'));
						} catch (err) {
							return reject(err);
						}
					});
				});

				// If "copy" is empty
				reject(_this._res(true, undefined, 'copy() method was called but "copy" property is empty.'));
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
				optionCSS.replace = new RegExp(this.config.replace.css.commentRegex, 'g');
				optionCSS.with = '\n\t\t\t<link rel="stylesheet" href="' + this.config.replace.css.with + '" />\n\t\t\t';
			}

			if (this.config.replace && this.config.replace.js) {
				optionJS.files = _path2.default.join(_path2.default.resolve(this.config.workspace), this.config.replace.js.files);
				optionJS.replace = new RegExp(this.config.replace.js.commentRegex, 'g');
				optionJS.with = '\n\t\t\t<script src="' + this.config.replace.js.with + '"></script>\n\t\t\t';
			}

			if (optionJS.files === undefined && optionCSS.files === undefined) {
				throw new Error('WARNING REPLACE(): replace method called but "files" not found in configuration');
			}

			// NOTE: can't use Promise.all 'cause we are modifying the same file
			// First check for CSS option and then for JS option
			return (0, _replaceInFile2.default)(optionCSS.files ? optionCSS : optionJS).then(function () {
				if (optionCSS.files) {
					return (0, _replaceInFile2.default)(optionJS);
				}
				// Return a simple promise if we have only one option
				return new Promise(function (resolve) {
					return resolve(true);
				});
			}).then(function () {
				return true;
			}).catch(function (err) {
				throw new Error(err);
			});
		}
	}, {
		key: 'build',
		value: function build() {
			var _this2 = this;

			this._ensureWorkspace();

			var resWebpack = void 0;
			var resVulcanize = void 0;

			return this.Builder.webpack().then(function (res) {
				resWebpack = res;
				return _this2.Builder.vulcanize();
			}).then(function (res) {
				resVulcanize = res;
				return {
					resWebpack: resWebpack,
					resVulcanize: resVulcanize
				};
			}).catch(function (err) {
				throw err;
			});
		}
	}, {
		key: 'minify',
		value: function minify() {
			var pJS = this.Minifier.minifyJS();
			var pCSS = this.Minifier.minifyCSS();
			return Promise.all([pJS, pCSS]).then(function (res) {
				return res;
			});
		}
	}, {
		key: 'bump',
		value: function bump(type) {
			var _this3 = this;

			return new Promise(function (resolve, reject) {
				if (type === null || type === undefined) {
					return reject(_this3._res(true, undefined, 'BUMP(): type must be specified.'));
				}

				var oldVersion = '';
				var newVersion = '';
				var dataFiles = _this3.config.packageFiles.reduce(function (acc, filePath) {
					var fullFilePath = _path2.default.resolve(filePath);
					var data = JSON.parse(_fsExtra2.default.readFileSync(fullFilePath, 'utf8'));
					var old = data.version;
					data.version = _semver2.default.inc(data.version, type);
					oldVersion = old;
					newVersion = data.version;

					var dataString = JSON.stringify(data, null, '\t');
					_fsExtra2.default.writeFileSync(fullFilePath, dataString);
					return acc.concat(data);
				}, []);

				return resolve(_this3._res(undefined, dataFiles, 'Bump from ' + oldVersion + ' to ' + newVersion + ' completed.'));
			});
		}
	}, {
		key: '_createWorkspace',
		value: function _createWorkspace() {
			try {
				var pathWorkspace = _path2.default.resolve(this.config.workspace);
				_fsExtra2.default.ensureDirSync(pathWorkspace);
				_fsExtra2.default.copySync(_path2.default.resolve(this.config.sourceApp), pathWorkspace);
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
		key: '_res',
		value: function _res(err, data, message) {
			var stringified = JSON.stringify({ err: err, data: data, message: message });
			return Object.assign({}, JSON.parse(stringified));
		}
	}, {
		key: '_checkForRequired',
		value: function _checkForRequired() {
			if (!this.config.workspace || this.config.workspace === '') {
				throw this._pathErrHandler('config.workspace');
			}

			if (!this.config.sourceApp || this.config.sourceApp === '') {
				throw this._pathErrHandler('config.sourceApp');
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