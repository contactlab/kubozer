/* eslint "key-spacing": ["error", {"align": "colon"}] */

import path   from 'path';
import fs     from 'fs-extra';
import test   from 'ava';

import hashed, {ERROR_MSG} from '../dist/lib/hashed';

const DIST_DIR    = 'dist_hashed';
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

test('hashed', t => {
  t.is(typeof hashed, 'function', 'should be a function');
});

test('hashed(config, webpackconfig)', async t => {
  const result = await hashed(CONFIG, WEBPACKCONFIG);

  const bundleFile = path.join(WEBPACKCONFIG.output.path, WEBPACKCONFIG.output.filename);
  const styleFile  = path.join(CONFIG.buildFolder, CONFIG.assetsFolder, CONFIG.buildCssFile);

  const bundleFileBase = path.join(path.dirname(bundleFile), path.basename(bundleFile, '.js'));
  const styleFileBase  = path.join(path.dirname(styleFile), path.basename(styleFile, '.css'));

  t.truthy(result[bundleFile], 'map should have a key for bundle file');
  t.truthy(result[styleFile], 'map should have a key for styles file');
  t.true(result[bundleFile].indexOf(bundleFileBase) > -1, 'map should have a value for bundle file `hashed` version');
  t.true(result[styleFile].indexOf(styleFileBase) > -1, 'map should have a value for styles file `hashed` version');
});

test('hashed(undefined, webpackconfig)', async t => {
  const err = await t.throws(hashed(undefined, WEBPACKCONFIG));

  t.is(err.message, ERROR_MSG, 'should reject with an error');
});

test('hashed(config, undefined)', async t => {
  const err = await t.throws(hashed(CONFIG, undefined));

  t.is(err.message, ERROR_MSG, 'should reject with an error');
});

test.cb.after(t => {
  fs.remove(DIST, t.end);
});