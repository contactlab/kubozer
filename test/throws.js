import fs from 'fs-extra';
import test from 'ava';
import Fn from './../dist/index';

test('throw error when both configs are missing', t => {
  const err = t.throws(() => new Fn(), 'Missing configurations.');
});

test('throws copy() method without MANIFEST and files', async t => {
  const config = {
    workspace: './test/workspace',
    sourceFolder: './test/src-test',
    buildFolder: './test/build',
    manifest: false
  };
  const webpackConfig = {};
  const fn = new Fn(config, webpackConfig);
  const err = await t.throws(fn.copy());
  t.is(err.message, 'copy() method was called but "copy" property is empty or undefined.');
  t.false(fs.existsSync(`${__dirname}/build/manifest.json`), 'Manifest is correctly NOT copied');
});

test('throw error when "workspace" not present in config', t => {
  const config = {};
  const webpackConfig = {};
  const err = t.throws(() => new Fn(config, webpackConfig), 'Path must be a string. Received undefined --> config.workspace');
});

test('throw error when "sourceFolder" not present in config', t => {
  const config = {
    workspace: './test/workspace'
  };
  const webpackConfig = {};
  const err = t.throws(() => new Fn(config, webpackConfig), 'Path must be a string. Received undefined --> config.sourceFolder');
});

test('throw error when "buildFolder" not present in config', t => {
  const config = {
    workspace: './test/workspace',
    sourceFolder: './test/src-test'
  };
  const webpackConfig = {};
  const err = t.throws(() => new Fn(config, webpackConfig), 'Path must be a string. Received undefined --> config.buildFolder');
});

test('throw error (build()) when "entry" within the "webpack configuration" is not present in config', async t => {
  const confWebpack = require('./src-test/webpack.test.config');
  const config = {
    workspace: './test/workspace',
    sourceFolder: './test/src-test',
    buildFolder: './test/build',
    vulcanize: {
        srcTarget: 'index.html',
        buildTarget: 'index.html',
        conf: {
          stripComments: true,
          inlineScripts: true,
          inlineStyles: true
        }
      }
  };

  const webpackConfig = Object.assign({}, confWebpack);
  delete webpackConfig.entry;
  const fn = new Fn(config, webpackConfig);
  const err = await t.throws(fn.build());
  t.is(err.err, 'WebpackOptionsValidationError');
  t.is(err.message, `Invalid configuration object. Webpack has been initialised using a configuration object that does not match the API schema.\n - configuration misses the property 'entry'.\n   object { <key>: non-empty string | [non-empty string] } | non-empty string | [non-empty string] | function\n   The entry point(s) of the compilation.`)
});


// A test for the future, when check for output.path and filename

// test('throw error (build()) when a required prop within the "webpack configuration" is not present in config', async t => {
// 	const confWebpack = require('./src-test/webpack.test.config');
// 	const config = {
// 		workspace: './test/workspace',
// 		sourceFolder: './test/src-test',
// 		buildFolder: './test/build',
// 	};

// 	const webpackConfig = Object.assign({}, confWebpack);
// 	delete webpackConfig.output;
// 	const fn = new Fn(config, webpackConfig);
// 	const err = await t.throws(fn.build());
// 	// t.true(err.err);
// 	t.is(err, 'Webpack entry point is not present. ---> webpackConfig.entry === undefined')
// });

test('throw error (build()) when "vulcanize" not present in config', async t => {
  const confWebpack = require('./src-test/webpack.test.config');
  const config = {
    workspace: './test/workspace',
    sourceFolder: './test/src-test',
    buildFolder: './test/build',
  };
  const webpackConfig = confWebpack;
  const fn = new Fn(config, webpackConfig);
  const err = await t.throws(fn.build());
  t.true(err.err);
  t.is(err.message, 'Vulcanize configuration is not present. ---> config.vulcanize === undefined')
});

test('throw error when bump() method is called without params', async t => {
    const confWebpack = require('./src-test/webpack.test.config');
    const config = {
      workspace: './test/workspace',
      buildFolder: './test/build',
      sourceFolder: './test/src-test',
      bump: {
        files: [
          './test/src-test/package.json',
          './test/src-test/manifest.json'
        ]
      }
    };
    const webpackConfig = confWebpack;
    const fn = new Fn(config, webpackConfig);
    const err = await t.throws(fn.bump());
    t.is(err.message, `BUMP(): type must be specified. This is not a valid type --> 'undefined'`);
});

test('throw error vulcanize throws and error', async t => {
    const confWebpack = require('./src-test/webpack.test.config');
    const config = {
      workspace: './test/workspace',
      buildFolder: './test/build',
      sourceFolder: './test/src-test',
      vulcanize: {
        srcTarget: 'asdasdasdaindex.html',
        buildTarget: 'index.html',
        conf: {
          stripComments: true,
          inlineScripts: true,
          inlineStyles: true
        }
      }
    };
    const webpackConfig = confWebpack;
    const fn = new Fn(config, webpackConfig);
    const err = await t.throws(fn.build());
    t.is(err.message, `ENOENT: no such file or directory, open '${__dirname}/workspace/asdasdasdaindex.html' | Did you checked the \"excludes\" property of \"vulcanize\" configuration?`);
});


test.afterEach.always(t => {
  fs.removeSync('./test/build');
  fs.removeSync('./test/workspace');
});
