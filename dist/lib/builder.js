/**
 * Builds with Webpack and vulcanize index.html
 * @module lib/builder
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

var _webpack2 = require('webpack');

var _webpack3 = _interopRequireDefault(_webpack2);

var _webpackNotifier = require('webpack-notifier');

var _webpackNotifier2 = _interopRequireDefault(_webpackNotifier);

var _vulcanize = require('vulcanize');

var _vulcanize2 = _interopRequireDefault(_vulcanize);

var _result = require('./result');

var _hashedResources = require('./hashed-resources');

var _hashedResources2 = _interopRequireDefault(_hashedResources);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WEBPACK_COMPLETED = 'Webpack compilation completed';
var VULCANIZE_COMPLETED = 'Vulcanize completed.';
var VULCANIZE_NO_CONF = 'Vulcanize configuration is not present. ---> config.vulcanize === undefined';

var Builder = function () {
  function Builder(config, webpackConfig) {
    _classCallCheck(this, Builder);

    this.config = config;
    this.webpackConfig = webpackConfig;
  }

  _createClass(Builder, [{
    key: 'webpack',
    value: function webpack(minify) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _fsExtra2.default.ensureDirSync(_this.config.buildFolder);

        if (minify) {
          var uglify = new _webpack3.default.optimize.UglifyJsPlugin({
            comments: false,
            compress: {
              warnings: false,
              /* eslint-disable camelcase */
              drop_console: _this.config.stripConsole
            },
            sourceMap: true
          });

          _this.webpackConfig.plugins = _this.webpackConfig.plugins ? _this.webpackConfig.plugins.concat(uglify) : [uglify];
          _this.webpackConfig.plugins = _this.webpackConfig.plugins.concat(new _webpackNotifier2.default({
            title: 'Kubozer - Webpack',
            contentImage: _path2.default.join(__dirname, './../../', 'Kubozer_Sign@2x.png')
          }));
        }

        try {
          var compiler = (0, _webpack3.default)(_this.webpackConfig);
          compiler.run(function (err) {
            if (err) {
              return reject((0, _result.error)(err));
            }

            return resolve((0, _result.success)(WEBPACK_COMPLETED, [{ completed: true }]));
          });
        } catch (err) {
          return reject((0, _result.error)(err.message, err.name));
        }
      });
    }
  }, {
    key: 'vulcanize',
    value: function vulcanize() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        if (_this2.config.vulcanize === undefined) {
          reject((0, _result.error)(VULCANIZE_NO_CONF));
        }

        var vulcan = new _vulcanize2.default(_this2.config.vulcanize.conf);

        var workspaceIndex = _path2.default.join(_path2.default.resolve(_this2.config.workspace), _this2.config.vulcanize.srcTarget);
        var buildIndex = _path2.default.join(_path2.default.resolve(_this2.config.buildFolder), _this2.config.vulcanize.buildTarget);

        vulcan.process(workspaceIndex, function (err, inlinedHTML) {
          if (err) {
            var msg = err.message + ' | Did you checked the "excludes" property of "vulcanize" configuration?';

            return reject((0, _result.error)(err.message.search('no such file') > -1 ? msg : err.message));
          }

          _fsExtra2.default.ensureFileSync(buildIndex);
          _fsExtra2.default.writeFile(buildIndex, inlinedHTML, function (err) {
            if (err) {
              return reject(err);
            }

            return resolve((0, _result.success)(VULCANIZE_COMPLETED, buildIndex));
          });
        });
      });
    }
  }, {
    key: 'hashed',
    value: function hashed() {
      return (0, _hashedResources2.default)(this.config, this.webpackConfig);
    }
  }]);

  return Builder;
}();

exports.default = Builder;