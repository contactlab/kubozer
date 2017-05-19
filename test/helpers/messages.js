/**
 * Colored console messages.
 * @module test/helpers/messages
 */

/* eslint "key-spacing": ["error", {"align": "colon"}] */

const chalk = require('chalk');

module.exports = {
  red   : chalk.red,
  severe: chalk.bold.underline.red,
  warn  : chalk.underline.yellow,
  green : chalk.green
};
