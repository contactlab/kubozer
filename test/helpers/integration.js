/**
 * Integration tests helpers
 * @module test/helpers/integration
 */

const path = require('path');
const fs   = require('fs-extra');

const INTEGRATION = path.resolve(__dirname, '..', 'integration');
const DEFAULT_TPL = path.resolve(INTEGRATION, 'template');

// dist :: String -> String
const dist = name => `dist_${name}`;

// distDir :: String -> String
const distDir = name => path.resolve(INTEGRATION, dist(name));

// tplDir :: String -> String
const tplDir = name => path.resolve(INTEGRATION, `template_${name}`);

// tpl :: String -> Promise
const tpl = name =>
  fs.pathExists(tplDir(name))
    .then(exists => exists ? tplDir(name) : DEFAULT_TPL);

// distFromTpl :: String -> Promise
const distFromTpl = name =>
  tpl(name)
    .then(template => fs.copy(template, distDir(name)));

// clean :: String -> Promise
const clean = name => fs.remove(distDir(name));

module.exports = {
  dist,
  distFromTpl,
  clean
};
