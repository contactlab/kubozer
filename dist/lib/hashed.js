'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ERROR_MSG = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _hashmark = require('hashmark');

var _hashmark2 = _interopRequireDefault(_hashmark);

var _pify = require('pify');

var _pify2 = _interopRequireDefault(_pify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ERROR_MSG = exports.ERROR_MSG = 'Missing configurations.'; /**
                                                                * Create an hashed version of static resources provided by configuration.
                                                                * @module lib/hashed
                                                                */

/* eslint "key-spacing": ["error", {"align": "colon"}] */

var pHashmark = (0, _pify2.default)(_hashmark2.default);

var OPTIONS = {
  digest: 'sha256',
  length: 8,
  pattern: '{dir}/{name}-{hash}{ext}',
  cwd: '.',
  rename: true
};

// hashed :: (Object, Object) -> Promise
var hashed = function hashed(config, webpackconfig) {
  if (!config || !webpackconfig) {
    return Promise.reject(new Error(ERROR_MSG));
  }

  var buildFolder = config.buildFolder,
      assetsFolder = config.assetsFolder,
      buildCssFile = config.buildCssFile;
  var _webpackconfig$output = webpackconfig.output,
      bundleDir = _webpackconfig$output.path,
      bundleFile = _webpackconfig$output.filename;


  var files = [_path2.default.join(buildFolder, assetsFolder, buildCssFile), _path2.default.join(bundleDir, bundleFile)];

  return pHashmark(files, OPTIONS);
};

exports.default = hashed;