'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ERROR_MSG = exports.SUCCESS_MSG = undefined;

var _compose = require('ramda/src/compose');

var _compose2 = _interopRequireDefault(_compose);

var _hashed = require('./hashed');

var _hashed2 = _interopRequireDefault(_hashed);

var _relativeTo = require('./relative-to');

var _relativeTo2 = _interopRequireDefault(_relativeTo);

var _distribution = require('./distribution');

var _distribution2 = _interopRequireDefault(_distribution);

var _fromTo = require('./from-to');

var _fromTo2 = _interopRequireDefault(_fromTo);

var _replace = require('./replace');

var _replace2 = _interopRequireDefault(_replace);

var _result = require('./result');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SUCCESS_MSG = exports.SUCCESS_MSG = 'Hashing resources completed'; /**
                                                                        * Creates an hashed version of resources and replace references in `index.html`
                                                                        * @module lib/hashed-resources
                                                                        */

var ERROR_MSG = exports.ERROR_MSG = 'Missing configurations.';

// hashedResources :: (Object, Object) -> Promise
var hashedResources = function hashedResources(config, webpackconfig) {
  return !config || !webpackconfig ? Promise.reject((0, _result.error)(ERROR_MSG)) : (0, _hashed2.default)(config, webpackconfig).then((0, _compose2.default)(_fromTo2.default, _distribution2.default, (0, _relativeTo2.default)(config.buildFolder))).then((0, _replace2.default)(config)).then(function () {
    return (0, _result.success)(SUCCESS_MSG);
  });
};

exports.default = hashedResources;