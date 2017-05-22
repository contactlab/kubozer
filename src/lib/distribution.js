/**
 * Distribute tuples from `[[a, a1], [b, b1]]` to `[[a, b], [a1, b1]]`.
 * @module lib/distribution
 */

// type Tuple<T> = [T, T]

// splitTuple :: Tuple a -> [[a]]
const splitTuple = (t = [], seed) => {
  const a = [];
  let i = 0;

  while (i < t.length) {
    const v = t[i];

    if (v) {
      a.push((seed[i] ? seed[i].concat(v) : Array.of(v)));
    }

    i++;
  }

  return a;
};

// distribution :: [Tuple a] -> [[a]]
const distribution = (as = []) =>
  as.reduce((acc, t) => splitTuple(t, acc), []);

export default distribution;
