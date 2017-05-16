/* eslint "key-spacing": ["error", {"align": "colon"}] */

import test       from 'ava';
import relativeTo from '../dist/lib/relative-to';

const FOLDER     = './dist';
const ASSETS_MAP = {
  './dist/bundle.js'           : './dist/bundle-e3b0c442.js',
  './dist/assets/css/style.css': './dist/assets/css/style-743a3b3e.css'
};

test('relativeTo', t => {
  t.is(typeof relativeTo, 'function', 'should be a function');
});

test('relativeTo(folder)', t => {
  t.is(typeof relativeTo(FOLDER), 'function', 'should return a function');
});

test('relativeTo(folder)(assetsMap)', t => {
  const actual   = relativeTo(FOLDER)(ASSETS_MAP);
  const expected = [
    ['bundle.js', 'bundle-e3b0c442.js'],
    ['assets/css/style.css', 'assets/css/style-743a3b3e.css']
  ];

  t.deepEqual(actual, expected, 'should return an array of file paths tuples relative to folder');

  const actual2   = relativeTo('.')(ASSETS_MAP);
  const expected2 = [
    ['dist/bundle.js', 'dist/bundle-e3b0c442.js'],
    ['dist/assets/css/style.css', 'dist/assets/css/style-743a3b3e.css']
  ];

  t.deepEqual(actual2, expected2, 'should return an array of file paths tuples relative to "."');
});

test('relativeTo(undefined)(assetsMap)', t => {
  const actual   = relativeTo(undefined)(ASSETS_MAP);
  const expected = [
    ['dist/bundle.js', 'dist/bundle-e3b0c442.js'],
    ['dist/assets/css/style.css', 'dist/assets/css/style-743a3b3e.css']
  ];

  t.deepEqual(actual, expected, 'should return an array of file paths tuples relative to "."');
});

test('relativeTo(FOLDER)(undefined | {})', t => {
  const actual   = relativeTo(FOLDER)(undefined);
  const expected = [];

  t.deepEqual(actual, expected, 'should return an empty array');

  const actual2   = relativeTo(FOLDER)({});
  const expected2 = [];

  t.deepEqual(actual2, expected2, 'should return an empty array');
});
