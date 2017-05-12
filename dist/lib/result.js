"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Returns a result object
 * @module lib/result
 */

var result = function result(err, data, message) {
  return Object.assign({}, { err: err, data: data, message: message });
};

var success = exports.success = function success(message, data) {
  return result(undefined, data, message);
};

var error = exports.error = function error(message) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  return result(type, undefined, message);
};

exports.default = result;