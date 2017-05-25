/* eslint "key-spacing": ["error", {"align": "colon"}] */

import path from 'path';
import fs   from 'fs-extra';
import test from 'ava';

import hashed from '../dist/lib/hashed';
import tmpDir from './helpers/tmp-dir';

import {ERROR_NO_CONFIG, ERROR_FILENAME_TPL_STR} from '../dist/lib/hashed';

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

test('hashed', t => {
  t.is(typeof hashed, 'function', 'should be a function');
});

test('hashed(config, webpackconfig)', async t => {
  const {config, webpack} = t.context;
  const result  = await hashed(config, webpack);

  const bundleFile = path.relative('.', path.join(webpack.output.path, webpack.output.filename));
  const styleFile  = path.relative('.', path.join(config.buildFolder, config.assetsFolder, config.buildCssFile));

  const bundleFileBase = path.join(path.dirname(bundleFile), path.basename(bundleFile, '.js'));
  const styleFileBase  = path.join(path.dirname(styleFile), path.basename(styleFile, '.css'));

  t.truthy(result[bundleFile], 'map should have a key for bundle file');
  t.truthy(result[styleFile], 'map should have a key for styles file');
  t.true(result[bundleFile].indexOf(bundleFileBase) > -1, 'map should have a value for bundle file `hashed` version');
  t.true(result[styleFile].indexOf(styleFileBase) > -1, 'map should have a value for styles file `hashed` version');
});

test('hashed(config, webpackconfig) - webpack with multiple entries', async t => {
  const {config, tmpDir} = t.context;
  const webpack = {
    entry: {
      main: path.join(tmpDir, 'dist/bundle.js'),
      ext : path.join(tmpDir, 'dist/assets/js/ext-lib.js')
    },
    output: {
      path    : path.join(tmpDir, 'dist'),
      filename: '[name].bundle.js'
    }
  };

  await fs.copy(webpack.entry.main, path.join(webpack.output.path, 'main.bundle.js'));
  await fs.copy(webpack.entry.ext, path.join(webpack.output.path, 'ext.bundle.js'));

  const result  = await hashed(config, webpack);

  const mainFile     = path.relative('.', path.join(webpack.output.path, 'main.bundle.js'));
  const extFile     = path.relative('.', path.join(webpack.output.path, 'ext.bundle.js'));

  const mainFileBase = path.join(path.dirname(mainFile), path.basename(mainFile, '.js'));
  const extFileBase = path.join(path.dirname(extFile), path.basename(extFile, '.js'));

  t.truthy(result[mainFile], 'map should have a key for main bundle file');
  t.truthy(result[extFile], 'map should have a key for ext bundle file');
  t.true(result[mainFile].indexOf(mainFileBase) > -1, 'map should have a value for main bundle file `hashed` version');
  t.true(result[extFile].indexOf(extFileBase) > -1, 'map should have a value for ext bundle file `hashed` version');
});

test('hashed(config, webpackconfig) - no supported template string in output.filename', async t => {
  const {config, tmpDir} = t.context;
  const webpack = {
    output: {
      path    : path.join(tmpDir, 'dist'),
      filename: '[id].bundle.js'
    }
  };
  const err = await t.throws(hashed(config, webpack));

  t.is(err.message, ERROR_FILENAME_TPL_STR, 'should reject with an error');
});

test('hashed(undefined, webpackconfig)', async t => {
  const {webpack} = t.context;
  const err = await t.throws(hashed(undefined, webpack));

  t.is(err.message, ERROR_NO_CONFIG, 'should reject with an error');
});

test('hashed(config, undefined)', async t => {
  const {config} = t.context;
  const err = await t.throws(hashed(config, undefined));

  t.is(err.message, ERROR_NO_CONFIG, 'should reject with an error');
});

test.afterEach.always(async t => {
  await fs.remove(t.context.tmpDir);
});
