/* eslint "key-spacing": ["error", {"align": "colon"}] */

import path from 'path';
import fs   from 'fs-extra';
import test from 'ava';
import pify from 'pify';

import
  hashedResources,
  {SUCCESS_MSG, ERROR_MSG}
from '../dist/lib/hashed-resources';

const DIST_DIR    = 'dist_hashed_resources';
const INTEGRATION = path.resolve(__dirname, 'integration');
const TPL         = path.resolve(INTEGRATION, 'template');
const DIST        = path.resolve(INTEGRATION, DIST_DIR);
const CONFIG      = {
  buildFolder : `./test/integration/${DIST_DIR}`,
  assetsFolder: 'assets',
  buildCssFile: 'css/style.css'
};
const WEBPACKCONFIG = {
  output: {
    path    : `./test/integration/${DIST_DIR}`,
    filename: 'bundle.js'
  }
};

test.cb.before(t => {
  fs.copy(TPL, DIST, t.end);
});

test('hashedResources', t => {
  t.is(typeof hashedResources, 'function', 'should be a function');
});

test('hashedResources(config, webpackconfig)', async t => {
  const {output}                                  = WEBPACKCONFIG;
  const {buildFolder, assetsFolder, buildCssFile} = CONFIG;

  const bundleFile = path.relative(DIST, path.resolve(output.path, output.filename));
  const stylesFile = path.relative(DIST, path.resolve(buildFolder, assetsFolder, buildCssFile));

  const bundleFileBase = path.join(path.dirname(bundleFile), path.basename(bundleFile, '.js'));
  const stylesFileBase = path.join(path.dirname(stylesFile), path.basename(stylesFile, '.css'));

  const bundleMatch = ` src="${bundleFileBase}-`;
  const stylesMatch = ` href="${stylesFileBase}-`;

  const result = await hashedResources(CONFIG, WEBPACKCONFIG);

  t.is(result.message, SUCCESS_MSG, 'should exit with success message');

  const fileContent = await pify(fs.readFile)(path.resolve(DIST, 'index.html'), 'utf8');

  t.true(fileContent.indexOf(bundleMatch) > -1, 'index.html should contain the hashed version of bundle file');
  t.true(fileContent.indexOf(stylesMatch) > -1, 'index.html should contain the hashed version of styles file');
});

test('hashedResources(undefined, webpackconfig)', async t => {
  const err = await t.throws(hashedResources(undefined, WEBPACKCONFIG));

  t.true(err.err, 'should return an error');
  t.is(err.message, ERROR_MSG, 'should reject with an error message');
});

test('hashedResources(config, undefined)', async t => {
  const err = await t.throws(hashedResources(CONFIG, undefined));

  t.true(err.err, 'should return an error');
  t.is(err.message, ERROR_MSG, 'should reject with an error message');
});

test.cb.after(t => {
  fs.remove(DIST, t.end);
});
