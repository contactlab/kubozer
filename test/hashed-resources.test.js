/* eslint "key-spacing": ["error", {"align": "colon"}] */

import path from 'path';
import fs   from 'fs-extra';
import test from 'ava';

import hashedResources, {SUCCESS_MSG, ERROR_MSG} from '../dist/lib/hashed-resources';
import tmpDir                                    from './helpers/tmp-dir';

const _config = dir => ({
  buildFolder : path.join(dir, 'dist'),
  assetsFolder: 'assets',
  buildCssFile: 'css/style.css'
});

const _webpackConfig = dir => ({
  output: {
    path    : path.join(dir, 'dist'),
    filename: 'bundle.js'
  }
});

test.beforeEach(async t => {
  // eslint-disable-next-line ava/use-t-well
  const workDir = await tmpDir(path.join(__dirname, 'integration/dist'), t.title);

  t.context.tmpDir = workDir;
  t.context.config = _config(workDir);
  t.context.webpack = _webpackConfig(workDir);
});

test('hashedResources', t => {
  t.is(typeof hashedResources, 'function', 'should be a function');
});

test('hashedResources(config, webpackconfig)', async t => {
  const {config, webpack, tmpDir}                 = t.context;
  const {output}                                  = webpack;
  const {buildFolder, assetsFolder, buildCssFile} = config;
  const distDir                                   = path.join(tmpDir, 'dist');

  const bundleFile = path.relative(distDir, path.resolve(output.path, output.filename));
  const stylesFile = path.relative(distDir, path.resolve(buildFolder, assetsFolder, buildCssFile));

  const bundleFileBase = path.join(path.dirname(bundleFile), path.basename(bundleFile, '.js'));
  const stylesFileBase = path.join(path.dirname(stylesFile), path.basename(stylesFile, '.css'));

  const bundleMatch = ` src="${bundleFileBase}-`;
  const stylesMatch = ` href="${stylesFileBase}-`;

  const result = await hashedResources(config, webpack);

  t.is(result.message, SUCCESS_MSG, 'should exit with success message');

  const fileContent = await fs.readFile(path.join(distDir, 'index.html'), 'utf8');

  t.true(fileContent.indexOf(bundleMatch) > -1, 'index.html should contain the hashed version of bundle file');
  t.true(fileContent.indexOf(stylesMatch) > -1, 'index.html should contain the hashed version of styles file');
});

test('hashedResources(undefined, webpackconfig)', async t => {
  const {webpack} = t.context;
  const err       = await t.throws(hashedResources(undefined, webpack));

  t.true(err.err, 'should return an error');
  t.is(err.message, ERROR_MSG, 'should reject with an error message');
});

test('hashedResources(config, undefined)', async t => {
  const {config} = t.context;
  const err      = await t.throws(hashedResources(config, undefined));

  t.true(err.err, 'should return an error');
  t.is(err.message, ERROR_MSG, 'should reject with an error message');
});

test.afterEach.always(async t => {
  await fs.remove(t.context.tmpDir);
});
