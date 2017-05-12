/**
 * Returns a result object
 * @module lib/result
 */

const result = (err, data, message) => Object.assign({}, {err, data, message});

export default result;
