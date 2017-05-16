/* eslint "key-spacing": ["error", {"align": "colon"}] */

import path from 'path';
import fs   from 'fs-extra';
import test from 'ava';

import
  replaceWithHashed,
  {ERROR_CONF_MSG, ERROR_REPLACEMENT_MSG}
from '../dist/lib/replace';

const DIST_DIR    = 'dist_replace';
const INTEGRATION = path.resolve(__dirname, 'integration');
const TPL         = path.resolve(INTEGRATION, 'template');
const DIST        = path.resolve(INTEGRATION, DIST_DIR);
const CONFIG      = {
  buildFolder : `./test/integration/${DIST_DIR}`,
  assetsFolder: 'assets',
  buildCssFile: 'css/style.css'
};
const REPLACEMENT = {
  from: ['bundle.js', 'assets/css/style.css'],
  to  : ['bundle-asdasd.js', 'assets/css/style-asdasd.css']
};

test.cb.before(t => {
  fs.copy(TPL, DIST, t.end);
});

test('replaceWithHashed', t => {
  t.is(typeof replaceWithHashed, 'function', 'should be a function');
});

test('replaceWithHashed(config)(replacement)', async t => {
  const replaceMap = await replaceWithHashed(CONFIG)(REPLACEMENT);
  const result     = fs.readFileSync(replaceMap[0], 'utf8');
  const jsSnippet  = '<script src="bundle-asdasd.js"></script>';
  const cssSnippet = '<link rel="stylesheet" href="assets/css/style-asdasd.css" />';

  t.true(result.indexOf(jsSnippet) > -1, 'should replace bundle file');
  t.true(result.indexOf(cssSnippet) > -1, 'should replace styles file');
});

test('replaceWithHashed(undefined)(replacement)', async t => {
  const err = await t.throws(replaceWithHashed(undefined)(REPLACEMENT));

  t.is(err.message, ERROR_CONF_MSG, 'should reject with an error');
});

test('replaceWithHashed(config, undefined)', async t => {
  const err = await t.throws(replaceWithHashed(CONFIG)(undefined));

  t.is(err.message, ERROR_REPLACEMENT_MSG, 'should reject with an error');
});

test.cb.after(t => {
  fs.remove(DIST, t.end);
});
