/* eslint "key-spacing": ["error", {"align": "colon"}] */

import fs   from 'fs-extra';
import test from 'ava';

import replaceWithHashed, {ERROR_CONF_MSG, ERROR_REPLACEMENT_MSG} from '../dist/lib/replace';
import helpers from './helpers/integration';

const NAME = 'replace';

const CONFIG = {
  buildFolder : `./test/integration/${helpers.dist(NAME)}`,
  assetsFolder: 'assets',
  buildCssFile: 'css/style.css'
};

const REPLACEMENT = {
  from: ['bundle.js', 'assets/css/style.css'],
  to  : ['bundle-asdasd.js', 'assets/css/style-asdasd.css']
};

test.before(async () => {
  await helpers.distFromTpl(NAME);
});

test('replaceWithHashed', t => {
  t.is(typeof replaceWithHashed, 'function', 'should be a function');
});

test('replaceWithHashed(config)(replacement)', async t => {
  const replaceMap = await replaceWithHashed(CONFIG)(REPLACEMENT);
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
  const err = await t.throws(replaceWithHashed(CONFIG)(undefined));

  t.is(err.message, ERROR_REPLACEMENT_MSG, 'should reject with an error');
});

test.after.always(async () => {
  await helpers.clean(NAME);
});
