'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// type Tuple<T> = [T, T];

// tuple :: (a, Object) -> Tuple a
var tuple = function tuple(k, a) {
  return [k, a[k]];
};

// toTuples :: Object{a: a} -> ([a], a) -> [Tuple a]
/**
 * Transform the `haskmark` assets JSON map into an array of tuples, with files path relative to specified folder.
 * @module lib/relative-to
 */

var toTuples = function toTuples(a) {
  return function (xs, k) {
    return xs.concat([tuple(k, a)]);
  };
};

// tuplesRelativeTo :: String -> Tuple -> Tuple
var tuplesRelativeTo = function tuplesRelativeTo(folder) {
  return function (t) {
    return t.map(function (file) {
      return _path2.default.relative(folder, file);
    });
  };
};

// relativeTo :: String -> Object{a: a} -> [Tuple a]
var relativeTo = function relativeTo() {
  var folder = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '.';
  return function () {
    var a = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return Object.keys(a).reduce(toTuples(a), []).map(tuplesRelativeTo(folder));
  };
};

exports.default = relativeTo;