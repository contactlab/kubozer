'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _webpack2 = require('webpack');

var _webpack3 = _interopRequireDefault(_webpack2);

var _vulcanize = require('vulcanize');

var _vulcanize2 = _interopRequireDefault(_vulcanize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Builder = function () {
	function Builder(config, webpackConfig, resFunc) {
		_classCallCheck(this, Builder);

		this.config = config;
		this.webpackConfig = webpackConfig;

		this._res = resFunc;
	}

	_createClass(Builder, [{
		key: 'webpack',
		value: function webpack() {
			var _this = this;

			return new Promise(function (resolve, reject) {
				_fsExtra2.default.ensureDirSync(_this.config.buildFolder);
				_fsExtra2.default.ensureFileSync(_path2.default.resolve(_this.config.buildFolder, _this.config.buildJS));

				_this.webpackConfig.output.path = _this.config.buildFolder;
				_this.webpackConfig.output.filename = _this.config.buildJS;

				try {
					var compiler = (0, _webpack3.default)(_this.webpackConfig);
					compiler.run(function (err) {
						if (err) {
							return reject(_this._res(true, undefined, err));
						}
						return resolve(_this._res(undefined, [{ completed: true }], 'Webpack compilation completed'));
					});
				} catch (err) {
					return reject(_this._res(err.name, undefined, err.message));
				}
			});
		}
	}, {
		key: 'vulcanize',
		value: function vulcanize() {
			var _this2 = this;

			return new Promise(function (resolve, reject) {
				if (_this2.config.vulcanize === undefined) {
					reject(_this2._res(true, undefined, 'Vulcanize configuration is not present. ---> config.vulcanize === undefined'));
				}

				var vulcan = new _vulcanize2.default(_this2.config.vulcanize.conf);

				var workspaceIndex = _path2.default.join(_path2.default.resolve(_this2.config.workspace), _this2.config.vulcanize.srcTarget);
				var buildIndex = _path2.default.join(_path2.default.resolve(_this2.config.buildFolder), _this2.config.vulcanize.buildTarget);

				vulcan.process(workspaceIndex, function (err, inlinedHTML) {
					if (err) {
						var msg = err.message + ' | Did you checked the "excludes" property of "vulcanize" configuration?';
						return reject(_this2._res(true, undefined, err.message.search('no such file') > -1 ? msg : err.message));
					}
					_fsExtra2.default.ensureFileSync(buildIndex);
					_fsExtra2.default.writeFile(buildIndex, inlinedHTML, function (err) {
						if (err) {
							return reject(err);
						}
						return resolve(_this2._res(undefined, buildIndex, 'Vulcanize completed.'));
					});
				});
			});
		}
	}]);

	return Builder;
}();

exports.default = Builder;