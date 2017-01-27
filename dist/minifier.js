'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _nodeMinify = require('node-minify');

var _nodeMinify2 = _interopRequireDefault(_nodeMinify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Minifier = function () {
	function Minifier(config) {
		_classCallCheck(this, Minifier);

		this.config = config;
	}

	_createClass(Minifier, [{
		key: 'minifyJS',
		value: function minifyJS() {
			var buildPath = _path2.default.join(_path2.default.resolve(this.config.buildFolder), this.config.buildJS);
			var promise = _nodeMinify2.default.minify({
				compressor: 'gcc',
				input: buildPath,
				output: buildPath
			});

			return promise.then(function (res) {
				return res;
			});
		}
	}, {
		key: 'minifyCSS',
		value: function minifyCSS() {
			var srcPath = _path2.default.join(_path2.default.resolve(this.config.workspace), this.config.assetsFolderName);
			var buildPath = _path2.default.join(_path2.default.resolve(this.config.buildFolder), this.config.assetsFolderName);
			var buildCSS = this.config.buildCSS || 'style.min.css';
			var promise = _nodeMinify2.default.minify({
				compressor: 'yui-css',
				publicFolder: srcPath,
				input: this.config.srcCSS,
				output: buildPath + '/' + buildCSS
			});

			return promise.then(function (res) {
				return res;
			});
		}
	}]);

	return Minifier;
}();

exports.default = Minifier;