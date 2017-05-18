/**
 * Colored console messages.
 * @module test/helpers/messages
 */

/* eslint "key-spacing": ["error", {"align": "colon"}] */

const chalk = require('chalk');

const red = chalk.red;

module.exports = {
  red,
  severe: red.bold.underline,
  warn  : chalk.underline.yellow,
  green : chalk.green
};
