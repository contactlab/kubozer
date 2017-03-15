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
		this.languagesPath = config.i18n.languagesPath;
		this.format = config.i18n.format;
		this.baseOptions = {
			secret: config.i18n.secret,
			apiKey: config.i18n.apiKey,
			projectId: config.i18n.projectId
		};
	}

	_createClass(OneSky, [{
		key: 'getFilePath',
		value: function getFilePath(languagesPath, language) {
			return path.join(languagesPath, language + '.json');
		}
	}, {
		key: 'getFileName',
		value: function getFileName(language) {
			return language + '.json';
		}
	}, {
		key: 'upload',
		value: function upload(language) {
			var _this = this;

			/* istanbul ignore next */
			var filePath = this.getFilePath(this.languagesPath, language);

			/* istanbul ignore next */
			return new Promise(function (resolve, reject) {
				/* istanbul ignore next */
				fs.readFile(filePath, 'utf-8', function (err, data) {
					/* istanbul ignore next */
					if (err) {
						return reject(err);
					}

					/* istanbul ignore next */
					var options = Object.assign({}, _this.baseOptions, {
						language: language,
						fileName: _this.getFileName(language),
						keepStrings: false,
						content: data,
						format: _this.format
					});
					/* istanbul ignore next */
					onesky.postFile(options).then(function (content) {
						/* istanbul ignore next */
						return resolve(content);
					}).catch(function (err) {
						/* istanbul ignore next */
						return reject(err);
					});
				});
			});
		}
	}, {
		key: 'download',
		value: function download(language) {
			var _this2 = this;

			/* istanbul ignore next */
			return new Promise(function (resolve, reject) {
				/* istanbul ignore next */
				var options = Object.assign({}, _this2.baseOptions, {
					language: language,
					fileName: 'EN.json'
				});

				/* istanbul ignore next */
				onesky.getFile(options).then(function (content) {
					/* istanbul ignore next */
					var filePath = _this2.getFilePath(_this2.languagesPath, language);

					fs.writeFile(filePath, content, function (err) {
						/* istanbul ignore next */
						if (err) {
							return reject(err);
						}

						/* istanbul ignore next */
						return resolve(content);
					});
				}).catch(function (err) {
					/* istanbul ignore next */
					return reject(err);
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

			var configurationKeys = ['secret', 'apiKey', 'projectId', 'defaultLanguage', 'format', 'projectId', 'languagesPath'];
			configurationKeys.forEach(function (key) {
				return _this3._checkConfigurationKey(config, key);
			});
		}
	}]);

	return OneSky;
}();

exports.default = OneSky;