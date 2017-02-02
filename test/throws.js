import fs from 'fs-extra';
import test from 'ava';
import Fn from './../dist/index';

test('throw error when both configs are missing', t => {
	const err = t.throws(() => new Fn(), 'Missing configurations.');
});

test('throw error when "workspace" not present in config', t => {
	const config = {};
	const webpackConfig = {};
	const err = t.throws(() => new Fn(config, webpackConfig), 'Path must be a string. Received undefined --> config.workspace');
});

test('throw error when "sourceApp" not present in config', t => {
	const config = {
		workspace: './test/workspace'
	};
	const webpackConfig = {};
	const err = t.throws(() => new Fn(config, webpackConfig), 'Path must be a string. Received undefined --> config.sourceApp');
});

test('throw error when "buildFolder" not present in config', t => {
	const config = {
		workspace: './test/workspace',
		sourceApp: './test/src-test'
	};
	const webpackConfig = {};
	const err = t.throws(() => new Fn(config, webpackConfig), 'Path must be a string. Received undefined --> config.buildFolder');
});

test('throw error (build()) when "entry" within the "webpack configuration" is not present in config', async t => {
	const confWebpack = require('./src-test/webpack.test.config');
	const config = {
		workspace: './test/workspace',
		sourceApp: './test/src-test',
		buildFolder: './test/build-tmp',
	};

	const webpackConfig = Object.assign({}, confWebpack);
	delete webpackConfig.entry;
	const fn = new Fn(config, webpackConfig);
	const err = await t.throws(fn.build());
	t.true(err.err);
	t.is(err.message, 'Webpack entry point is not present. ---> webpackConfig.entry === undefined')
});


// A test for the future, when check for output.path and filename 

// test('throw error (build()) when a required prop within the "webpack configuration" is not present in config', async t => {
// 	const confWebpack = require('./src-test/webpack.test.config');
// 	const config = {
// 		workspace: './test/workspace',
// 		sourceApp: './test/src-test',
// 		buildFolder: './test/build-tmp',
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
		sourceApp: './test/src-test',
		buildFolder: './test/build-tmp',
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
			buildFolder: './test/build-tmp',
			sourceApp: './test/src-test',
			packageFiles: [
				'./test/src-test/package.json',
				'./test/src-test/manifest.json'
			],
		};
		const webpackConfig = confWebpack;
		const fn = new Fn(config, webpackConfig);
		const err = await t.throws(fn.bump());
		t.is(err.message, 'BUMP(): type must be specified.');
});

test('throw error vulcanize throws and error', async t => {
		const confWebpack = require('./src-test/webpack.test.config');
		const config = {
			workspace: './test/workspace',
			buildFolder: './test/build-tmp',
			sourceApp: './test/src-test',
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
	fs.removeSync('./test/build-tmp');
	fs.removeSync('./test/workspace');
});