'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ERROR_REPLACEMENT_MSG = exports.ERROR_CONF_MSG = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _replaceInFile = require('replace-in-file');

var _replaceInFile2 = _interopRequireDefault(_replaceInFile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-negated-condition: "off" */

/**
 * Replace occurences in `index.html` file based on provided `destination`.
 * @module lib/replace
 */

var ERROR_CONF_MSG = exports.ERROR_CONF_MSG = 'Missing configuration';
var ERROR_REPLACEMENT_MSG = exports.ERROR_REPLACEMENT_MSG = 'Missing replacement to make';

// type FromTo = {from: string[], to: string[]}

// errConf :: void -> Error
var errConf = function errConf() {
  return new Error(ERROR_CONF_MSG);
};

// errReplacement :: void -> Error
var errReplacement = function errReplacement() {
  return new Error(ERROR_REPLACEMENT_MSG);
};

// replace :: Object a -> FromTo b -> Promise
var replace = function replace(config) {
  return function (replacement) {
    if (!config || !replacement) {
      return Promise.reject(!config ? errConf() : errReplacement());
    }

    var options = Object.assign({
      files: _path2.default.resolve(config.buildFolder, 'index.html')
    }, replacement);

    return (0, _replaceInFile2.default)(options);
  };
};

exports.default = replace;