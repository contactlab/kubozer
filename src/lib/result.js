/**
 * Returns a result object
 * @module lib/result
 */

const result = (err, data, message) => Object.assign({}, {err, data, message});

export const success = (message, data) => result(undefined, data, message);

export const error = (message, type = true) => result(type, undefined, message);

export default result;
