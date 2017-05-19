/**
 * Merges object usign Object.assign
 * @module test/helpers/merge
 */

module.exports = (...args) => Object.assign.apply(null, [{}, ...args]);
