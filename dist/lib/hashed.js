'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ERROR_FILENAME_TPL_STR = exports.ERROR_NO_CONFIG = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /**
                                                                                                                                                                                                                                                                               * Create an hashed version of static resources provided by configuration.
                                                                                                                                                                                                                                                                               * @module lib/hashed
                                                                                                                                                                                                                                                                               */

/* eslint "key-spacing": ["error", {"align": "colon"}], new-cap: ["error", { "properties": false }] */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _hashmark = require('hashmark');

var _hashmark2 = _interopRequireDefault(_hashmark);

var _pify = require('pify');

var _pify2 = _interopRequireDefault(_pify);

var _concat = require('ramda/src/concat');

var _concat2 = _interopRequireDefault(_concat);

var _map = require('ramda/src/map');

var _map2 = _interopRequireDefault(_map);

var _data = require('data.either');

var _data2 = _interopRequireDefault(_data);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pHashmark = (0, _pify2.default)(_hashmark2.default);

var ERROR_NO_CONFIG = exports.ERROR_NO_CONFIG = 'Missing configurations.';
var ERROR_FILENAME_TPL_STR = exports.ERROR_FILENAME_TPL_STR = '`input` use an unsupported template string';
var ERROR_NO_TPL_STR = '`input` is not a template string';

var REGEXP = /\[(\w+)\]/i;
var SUPPORTED_TPL = '[name]';
var DEFAULT_REPLACEMENTS = ['main'];

var OPTIONS = {
  digest: 'sha256',
  length: 8,
  pattern: '{dir}/{name}-{hash}{ext}',
  cwd: '.',
  rename: true
};

// type ReplaceData = {tpl: string, input: string}
// isMulti :: * -> boolean
var isMulti = function isMulti(a) {
  return (typeof a === 'undefined' ? 'undefined' : _typeof(a)) === 'object' && !Array.isArray(a);
};
// err :: string -> Error
var err = function err(type) {
  return new Error(type);
};
// replace :: (ReplaceData, [string]) -> [string]
var replaceWith = function replaceWith(a, xs) {
  return xs.map(function (x) {
    return a.input.replace(a.tpl, x);
  });
};
// inDir :: string -> string -> string
var inDir = function inDir(dir) {
  return function (file) {
    return _path2.default.join(dir, file);
  };
};
// isTplStr :: string -> boolean
var isTplStr = function isTplStr(s) {
  return REGEXP.test(s);
};
// config :: Object a -> Either(Error, Object a)
var config = function config(c) {
  return _data2.default.fromNullable(c).leftMap(function () {
    return err(ERROR_NO_CONFIG);
  });
};

/* istanbul ignore next */
// match :: string -> Either(Error, string)
var match = function match(a) {
  return _data2.default.fromNullable(a.match(REGEXP)).leftMap(function () {
    return err(ERROR_NO_TPL_STR);
  });
};

// supported :: [string] -> Either(Error, ReplaceData)
var supported = function supported(as) {
  return as[0] === SUPPORTED_TPL ? _data2.default.Right({ tpl: as[0], input: as.input }) : _data2.default.Left(err(ERROR_FILENAME_TPL_STR));
};

// withReplace :: Object -> ReplaceData -> [string]
var withReplace = function withReplace(b) {
  return function (a) {
    return replaceWith(a, isMulti(b) ? Object.keys(b) : DEFAULT_REPLACEMENTS);
  };
};

// remapTplString :: (Object, string) -> Either(Error, string)
var remapTplString = function remapTplString(b, a) {
  return match(a).chain(supported).map(withReplace(b));
};

// bundle :: (Object, string) -> Either(Error, [string])
var bundle = function bundle(a, s) {
  return isTplStr(s) ? remapTplString(a, s) : _data2.default.of([s]);
};

// program :: Object -> Either(Error, [string])
var scripts = function scripts(c) {
  return config(c).chain(function (c) {
    return bundle(c.entry, c.output.filename).map((0, _map2.default)(inDir(c.output.path)));
  });
};

// program2 :: Object -> Either(Error, [string])
var styles = function styles(c) {
  return config(c).map(function (c) {
    return [_path2.default.join(c.buildFolder, c.assetsFolder, c.buildCssFile)];
  });
};

// hashed :: (Object, Object) -> Promise
var hashed = function hashed(config, webpackconfig) {
  return _data2.default.of(_concat2.default).ap(styles(config)).ap(scripts(webpackconfig)).cata({
    Left: function Left(l) {
      return Promise.reject(l);
    },
    Right: function Right(r) {
      return pHashmark(r, OPTIONS);
    }
  });
};

exports.default = hashed;