/* eslint "key-spacing": ["error", {"align": "colon"}] */

import test   from 'ava';
import fromTo from '../dist/lib/from-to';

const DATA = [
  ['bundle.js', 'assets/css/style.css'],
  ['bundle-e3b0c442.js', 'assets/css/style-743a3b3e.css']
];

test('fromTo', t => {
  t.is(typeof fromTo, 'function', 'should be a function');
});

test('fromTo(DATA)', t => {
  const actual   = fromTo(DATA);
  const expected = {
    from: ['bundle.js', 'assets/css/style.css'],
    to  : ['bundle-e3b0c442.js', 'assets/css/style-743a3b3e.css']
  };

  t.deepEqual(actual, expected, 'should convert `[[a, b], [a1, b1]]` to `{from: [a, b], to: [a1, b1]}`');
});

test('fromTo(undefined)', t => {
  const actual   = fromTo(undefined);
  const expected = {
    from: [],
    to  : []
  };

  t.deepEqual(actual, expected, 'should return `{from: [], to: []}`');
});

test('fromTo([[...], undefined])', t => {
  const actual   = fromTo([DATA[0], undefined]);
  const expected = {
    from: DATA[0],
    to  : []
  };

  t.deepEqual(actual, expected, 'should return `{from: [...], to: []}`');
});

test('fromTo([undefined, [...]])', t => {
  const actual   = fromTo([undefined, DATA[1]]);
  const expected = {
    from: [],
    to  : DATA[1]
  };

  t.deepEqual(actual, expected, 'should return `{from: [], to: [...]}`');
});
