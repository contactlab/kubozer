/* eslint "key-spacing": ["error", {"align": "colon"}] */

import path from 'path';
import fs   from 'fs-extra';
import test from 'ava';

import replaceWithHashed, {ERROR_CONF_MSG, ERROR_REPLACEMENT_MSG} from '../dist/lib/replace';
import tmpDir                                                     from './helpers/tmp-dir';

const _config = dir => ({
  buildFolder : path.join(dir, 'dist'),
  assetsFolder: 'assets',
  buildCssFile: 'css/style.css'
});

const REPLACEMENT = {
  from: ['bundle.js', 'assets/css/style.css'],
  to  : ['bundle-asdasd.js', 'assets/css/style-asdasd.css']
};

test.beforeEach(async t => {
  // eslint-disable-next-line ava/use-t-well
  const workDir = await tmpDir(path.join(__dirname, 'integration/dist'), t.title);

  t.context.tmpDir = workDir;
  t.context.config = _config(workDir);
});

test('replaceWithHashed', t => {
  t.is(typeof replaceWithHashed, 'function', 'should be a function');
});

test('replaceWithHashed(config)(replacement)', async t => {
  const {config}   = t.context;
  const replaceMap = await replaceWithHashed(config)(REPLACEMENT);
  const result     = await fs.readFile(replaceMap[0], 'utf8');

  const jsSnippet  = '<script src="bundle-asdasd.js"></script>';
  const cssSnippet = '<link rel="stylesheet" href="assets/css/style-asdasd.css" />';

  t.true(result.includes(jsSnippet), 'should replace bundle file');
  t.true(result.includes(cssSnippet), 'should replace styles file');
});

test('replaceWithHashed(undefined)(replacement)', async t => {
  const err = await t.throws(replaceWithHashed(undefined)(REPLACEMENT));

  t.is(err.message, ERROR_CONF_MSG, 'should reject with an error');
});

test('replaceWithHashed(config, undefined)', async t => {
  const {config} = t.context;
  const err      = await t.throws(replaceWithHashed(config)(undefined));

  t.is(err.message, ERROR_REPLACEMENT_MSG, 'should reject with an error');
});

test.afterEach.always(async t => {
  await fs.remove(t.context.tmpDir);
});
