"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/**
 * Converts an array of type `[[a, b], [a1, b1]]` into an object of type `{from: [a, b], to: [a1, b1]}`.
 * @module lib/from-to
 */

// type Distr<T> = [Array<T>, Array<T>]
// type FromTo<T> = { from: Array<T>, to: Array<To> }

// fromTo :: Distr a -> FromTo a
var fromTo = function fromTo() {
  var xs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [[], []];

  var _xs = _slicedToArray(xs, 2),
      _xs$ = _xs[0],
      from = _xs$ === undefined ? [] : _xs$,
      _xs$2 = _xs[1],
      to = _xs$2 === undefined ? [] : _xs$2;

  return { from: from, to: to };
};

exports.default = fromTo;