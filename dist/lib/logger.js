'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Logger = function () {
	function Logger() {
		_classCallCheck(this, Logger);

		this.log = console.log;
		this.logError = console.error;
		this.colors = _chalk2.default;
		this.error = _chalk2.default.bold.underline.red;
		this.success = _chalk2.default.bold.green;
	}

	_createClass(Logger, [{
		key: 'set',
		value: function set(msg, color) {
			this.log(this.colors[color].underline(msg));
		}

		// success(msg) {
		// 	this.log(this.success(msg));
		// }

	}, {
		key: 'fail',
		value: function fail(msg) {
			this.logError(this.error(msg));
		}
	}]);

	return Logger;
}();

exports.default = Logger;