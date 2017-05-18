/* eslint "key-spacing": ["error", {"align": "colon"}] */

import path from 'path';
import fs from 'fs-extra';
import test from 'ava';

import Kubozer from '../dist';
import tmpDir  from './helpers/tmp-dir';
import hconf   from './helpers/config';

test.beforeEach(async t => {
  // eslint-disable-next-line ava/use-t-well
  const workDir = await tmpDir(path.join(__dirname, 'integration/src'), t.title);

  t.context.tmpDir = workDir;
  t.context.webpackConfig = require(path.join(workDir, 'src/webpack.test.config'));
});

test('throw error when both configs are missing', t => {
  t.throws(() => new Kubozer(), 'Missing configurations.');
});

test('throws copy() method without MANIFEST and files', async t => {
  const config  = Object.assign({}, hconf(t.context.tmpDir, ['FOLDERS']), {manifest: false});
  const kubozer = new Kubozer(config, {});
  const err     = await t.throws(kubozer.copy());

  t.is(err.message, 'copy() method was called but "copy" property is empty or undefined.');
  t.false(await fs.pathExists(path.join(config.buildFolder, 'manifest.json')), 'Manifest is correctly NOT copied');
});

test('throw error when "workspace" not present in config', t => {
  t.throws(() => new Kubozer({}, {}), 'Path must be a string. Received undefined --> config.workspace');
});

test('throw error when "sourceFolder" not present in config', t => {
  const config = {
    workspace: path.join(t.context.tmpDir, 'workspace')
  };

  t.throws(() => new Kubozer(config, {}), 'Path must be a string. Received undefined --> config.sourceFolder');
});

test('throw error when "buildFolder" not present in config', t => {
  const config = {
    workspace   : path.join(t.context.tmpDir, 'workspace'),
    sourceFolder: path.join(t.context.tmpDir, 'src')
  };

  t.throws(() => new Kubozer(config, {}), 'Path must be a string. Received undefined --> config.buildFolder');
});

test('throw error (build()) when "entry" within the "webpack configuration" is not present in config', async t => {
  const {tmpDir, webpackConfig} = t.context;
  const config                  = hconf(tmpDir, ['FOLDERS', 'VULCANIZE']);

  const _webpackConfig = Object.assign({}, webpackConfig);
  delete _webpackConfig.entry;

  const kubozer = new Kubozer(config, _webpackConfig);
  const err     = await t.throws(kubozer.build());

  t.is(err.err, 'WebpackOptionsValidationError');
  t.is(err.message, `Invalid configuration object. Webpack has been initialised using a configuration object that does not match the API schema.\n - configuration misses the property 'entry'.\n   object { <key>: non-empty string | [non-empty string] } | non-empty string | [non-empty string] | function\n   The entry point(s) of the compilation.`);
});

test('throw error (build()) when "vulcanize" not present in config', async t => {
  const {tmpDir, webpackConfig} = t.context;
  const config                  = hconf(tmpDir, ['FOLDERS']);

  const kubozer = new Kubozer(config, webpackConfig);
  const err     = await t.throws(kubozer.build());

  t.true(err.err);
  t.is(err.message, 'Vulcanize configuration is not present. ---> config.vulcanize === undefined');
});

test('throw error when bump() method is called without params', async t => {
  const {tmpDir, webpackConfig} = t.context;
  const config                  = hconf(tmpDir, ['FOLDERS', 'BUMP']);

  const kubozer = new Kubozer(config, webpackConfig);
  const err     = await t.throws(kubozer.bump());

  t.is(err.message, `BUMP(): type must be specified. This is not a valid type --> 'undefined'`);
});

test('throw error vulcanize throws and error', async t => {
  const VULCANIZE = {
    vulcanize: {
      srcTarget  : 'asdasdasdaindex.html',
      buildTarget: 'index.html',
      conf       : {
        stripComments: true,
        inlineScripts: true,
        inlineStyles : true
      }
    }
  };

  const {tmpDir, webpackConfig} = t.context;
  const config                  = Object.assign({}, hconf(tmpDir, ['FOLDERS']), VULCANIZE);

  const kubozer          = new Kubozer(config, webpackConfig);
  const err              = await t.throws(kubozer.build());
  const vulcanizeSrcPath = path.join(config.workspace, VULCANIZE.vulcanize.srcTarget);

  // eslint-disable-next-line no-useless-escape
  t.is(err.message, `ENOENT: no such file or directory, open '${vulcanizeSrcPath}' | Did you checked the \"excludes\" property of \"vulcanize\" configuration?`);
});

test.afterEach.always(async t => {
  await fs.remove(t.context.tmpDir);
});
