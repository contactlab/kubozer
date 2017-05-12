'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ora = require('ora');

var _ora2 = _interopRequireDefault(_ora);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Spinner = function () {
  function Spinner(text) {
    _classCallCheck(this, Spinner);

    this.spinner = new _ora2.default({ text: text, spinner: 'dots', color: 'green' });
    this.spinner.start();
  }

  _createClass(Spinner, [{
    key: 'set',
    value: function set(msg, color) {
      this.spinner.color = color || 'cyan';
      this.spinner.text = msg;
      this.spinner.start();
    }
  }, {
    key: 'success',
    value: function success(msg) {
      this.spinner.color = 'green';
      this.spinner.succeed(msg);
    }
  }, {
    key: 'fail',
    value: function fail(msg) {
      this.spinner.color = 'red';
      this.spinner.fail(msg);
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.spinner.clear();
    }
  }]);

  return Spinner;
}();

exports.default = Spinner;