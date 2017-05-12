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

exports.default = result;