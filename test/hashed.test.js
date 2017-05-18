/* eslint "key-spacing": ["error", {"align": "colon"}] */

import path from 'path';
import fs   from 'fs-extra';
import test from 'ava';

import hashed, {ERROR_MSG} from '../dist/lib/hashed';
// import helpers             from './helpers/integration';
import tmpDir             from './helpers/tmp-dir';

// const NAME = 'hashed';

// const CONFIG = {
//   buildFolder : `./test/integration/${helpers.dist(NAME)}`,
//   assetsFolder: 'assets',
//   buildCssFile: 'css/style.css'
// };
const _config = dir => ({
  buildFolder : path.join(dir, 'dist'),
  assetsFolder: 'assets',
  buildCssFile: 'css/style.css'
});

// const WEBPACKCONFIG = {
//   output: {
//     path    : `./test/integration/${helpers.dist(NAME)}`,
//     filename: 'bundle.js'
//   }
// };
const _webpackConfig = dir => ({
  output: {
    path    : path.join(dir, 'dist'),
    filename: 'bundle.js'
  }
});

// test.before(async () => {
//   await helpers.distFromTpl(NAME);
// });
test.beforeEach(async t => {
  // eslint-disable-next-line ava/use-t-well
  t.context.tmpDir = await tmpDir(path.join(__dirname, 'integration/dist'), t.title);
});

test('hashed', t => {
  t.is(typeof hashed, 'function', 'should be a function');
});

test('hashed(config, webpackconfig)', async t => {
  const config  = _config(t.context.tmpDir);
  const webpack = _webpackConfig(t.context.tmpDir);
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

test('hashed(undefined, webpackconfig)', async t => {
  // const config  = _config(t.context.tmpDir);
  const webpack = _webpackConfig(t.context.tmpDir);
  const err = await t.throws(hashed(undefined, webpack));

  t.is(err.message, ERROR_MSG, 'should reject with an error');
});

test('hashed(config, undefined)', async t => {
  const config  = _config(t.context.tmpDir);
  // const webpack = _webpackConfig(t.context.tmpDir);
  const err = await t.throws(hashed(config, undefined));

  t.is(err.message, ERROR_MSG, 'should reject with an error');
});

// test.after.always(async () => {
//   await helpers.clean(NAME);
// });
test.afterEach.always(async t => {
  await fs.remove(t.context.tmpDir);
});
