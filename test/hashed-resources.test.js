/* eslint "key-spacing": ["error", {"align": "colon"}] */

import path from 'path';
import fs   from 'fs-extra';
import test from 'ava';

import hashedResources, {SUCCESS_MSG, ERROR_MSG} from '../dist/lib/hashed-resources';
import helpers                                   from './helpers/integration';

const NAME = 'hashed_resources';

const CONFIG = {
  buildFolder : `./test/integration/${helpers.dist(NAME)}`,
  assetsFolder: 'assets',
  buildCssFile: 'css/style.css'
};

const WEBPACKCONFIG = {
  output: {
    path    : `./test/integration/${helpers.dist(NAME)}`,
    filename: 'bundle.js'
  }
};

test.before(async () => {
  await helpers.distFromTpl(NAME);
});

test('hashedResources', t => {
  t.is(typeof hashedResources, 'function', 'should be a function');
});

test('hashedResources(config, webpackconfig)', async t => {
  const {output}                                  = WEBPACKCONFIG;
  const {buildFolder, assetsFolder, buildCssFile} = CONFIG;

  const bundleFile = path.relative(helpers.distDir(NAME), path.resolve(output.path, output.filename));
  const stylesFile = path.relative(helpers.distDir(NAME), path.resolve(buildFolder, assetsFolder, buildCssFile));

  const bundleFileBase = path.join(path.dirname(bundleFile), path.basename(bundleFile, '.js'));
  const stylesFileBase = path.join(path.dirname(stylesFile), path.basename(stylesFile, '.css'));

  const bundleMatch = ` src="${bundleFileBase}-`;
  const stylesMatch = ` href="${stylesFileBase}-`;

  const result = await hashedResources(CONFIG, WEBPACKCONFIG);

  t.is(result.message, SUCCESS_MSG, 'should exit with success message');

  const fileContent = await fs.readFile(path.resolve(helpers.distDir(NAME), 'index.html'), 'utf8');

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

test.after.always(async () => {
  await helpers.clean(NAME);
});
