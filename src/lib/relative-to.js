/**
 * Transform the `haskmark` assets JSON map into an array of tuples, with files path relative to specified folder.
 * @module lib/relative-to
 */

import path from 'path';

// type Tuple<T> = [T, T];

// tuple :: (a, Object) -> Tuple a
const tuple = (k, a) => [k, a[k]];

// toTuples :: Object{a: a} -> ([a], a) -> [Tuple a]
const toTuples = a => (xs, k) => xs.concat([tuple(k, a)]);

// tuplesRelativeTo :: String -> Tuple -> Tuple
const tuplesRelativeTo = folder => t => t.map(file => path.relative(folder, file));

// relativeTo :: String -> Object{a: a} -> [Tuple a]
const relativeTo = (folder = '.') => (a = {}) =>
  Object.keys(a)
    .reduce(toTuples(a), [])
    .map(tuplesRelativeTo(folder));

export default relativeTo;
