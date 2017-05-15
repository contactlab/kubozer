/**
 * Converts an array of type `[[a, b], [a1, b1]]` into an object of type `{from: [a, b], to: [a1, b1]}`.
 * @module lib/from-to
 */

// type Distr<T> = [Array<T>, Array<T>]
// type FromTo<T> = { from: Array<T>, to: Array<To> }

// fromTo :: Distr a -> FromTo a
const fromTo = (xs = [[], []]) => {
  const [from = [], to = []] = xs;

  return {from, to};
};

export default fromTo;
