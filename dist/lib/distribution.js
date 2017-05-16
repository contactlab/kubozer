"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Distribute tuples from `[[a, a1], [b, b1]]` to `[[a, b], [a1, b1]]`.
 * @module lib/distribution
 */

// type Tuple<T> = [T, T]

// splitTuple :: Tuple a -> [[a]]
var splitTuple = function splitTuple() {
  var t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var seed = arguments[1];

  var a = [];
  var i = 0;

  while (i < t.length) {
    var v = t[i];

    if (v) {
      a.push(seed[i] ? seed[i].concat(v) : Array.of(v));
    }

    i++;
  }

  return a;
};

// distribution :: [Tuple a] -> [[a]]
var distribution = function distribution() {
  var as = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return as.reduce(function (acc, t) {
    return splitTuple(t, acc);
  }, []);
};

exports.default = distribution;