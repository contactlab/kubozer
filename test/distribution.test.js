import test         from 'ava';
import distribution from '../dist/lib/distribution';

const TUPLES = [
  ['bundle.js', 'bundle-e3b0c442.js'],
  ['assets/css/style.css', 'assets/css/style-743a3b3e.css']
];

test('distribution', t => {
  t.is(typeof distribution, 'function', 'should be a function');
});

test('distribution(tuples)', t => {
  const actual   = distribution(TUPLES);
  const expected = [
    ['bundle.js', 'assets/css/style.css'],
    ['bundle-e3b0c442.js', 'assets/css/style-743a3b3e.css']
  ];

  t.deepEqual(actual, expected, 'should distribute an array of tuples');
});

test('distribution(undefined)', t => {
  const actual   = distribution(undefined);
  const expected = [];

  t.deepEqual(actual, expected, 'should return an empty array');
});

test('distribution([])', t => {
  const actual   = distribution([]);
  const expected = [];

  t.deepEqual(actual, expected, 'should return an empty array');

  const actual2   = distribution([undefined]);
  const expected2 = [];

  t.deepEqual(actual2, expected2, 'should return an empty array');

  const actual3   = distribution([[], []]);
  const expected3 = [];

  t.deepEqual(actual3, expected3, 'should return an empty array');

  const actual4   = distribution([[]]);
  const expected4 = [];

  t.deepEqual(actual4, expected4, 'should return an empty array');

  const actual5   = distribution([[undefined], [undefined]]);
  const expected5 = [];

  t.deepEqual(actual5, expected5, 'should return an empty array');
});
