import fs from 'fs-extra';
import test from 'ava';
import Fn from './../dist/index';

/**
 * WARNING: tests will run async
 */

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
	t.is(err.message, 'Vulcanize configuration is not present. ---> config.vulcanize === undefined')
});

test('correct deletePrevBuild()', t => {
	// Create the build folder
	const pathToDir = `${__dirname}/build-tmp`;
	fs.ensureDirSync(pathToDir);

	const config = {
		workspace: './test/workspace',
		sourceApp: './test/src-test',
		buildFolder: './test/build-tmp'
	};
	const webpackConfig = {};
	const fn = new Fn(config, webpackConfig);
	fn.deletePrevBuild();
	t.false(fs.existsSync(pathToDir), 'Correctly removed old build.');
});

test('correct copy() method without MANIFEST and files', async t => {
		const config = {
			workspace: './test/workspace',
			sourceApp: './test/src-test',
			buildFolder: './test/build-tmp',
			manifest: false
		};
		const webpackConfig = {};
		const fn = new Fn(config, webpackConfig);
		const err = await t.throws(fn.copy());
		t.is(err.message, 'copy() method was called but "copy" property is empty.');
		t.false(fs.existsSync(`${__dirname}/build-tmp/manifest.json`), 'Manifest is correctly NOT copied');
});

test('correct copy() method', async t => {
		const config = {
			workspace: './test/workspace',
			sourceApp: './test/src-test',
			buildFolder: './test/build-tmp',
			manifest: true,
			copy: [
				{
					base: 'assets',
					items: [
						'imgs-others'
					]
				}, {
					base: 'bundles',
					items: [
						''
					]
				}
			]

		};
		const webpackConfig = {};
		const fn = new Fn(config, webpackConfig);
		const copiedBundles = await fn.copy('bundles');
		t.is(fs.existsSync(`${__dirname}/build-tmp/assets/imgs-others`), true);
		t.is(fs.existsSync(`${__dirname}/build-tmp/bundles`), true);
		t.is(fs.existsSync(`${__dirname}/build-tmp/manifest.json`), true, 'Manifest is correctly copied');
});

test('correct build() method', async t => {
		const confWebpack = require('./src-test/webpack.test.config');
		const config = {
			workspace: './test/workspace',
			sourceApp: './test/src-test',
			buildFolder: './test/build-tmp',
			// OPTIONAL
			buildJS: 'bundle-test.js',
			manifest: true,
		  vulcanize: {
		    srcTarget: 'index.html',
		    buildTarget: 'index.html',
		    conf: {
		      stripComments: true,
		      inlineScripts: true,
		      inlineStyles: true,
		      excludes: [
						'bundle-fake.js',
						'js.js'
					]
		    }
		  }
		};
		const webpackConfig = confWebpack;
		const fn = new Fn(config, webpackConfig);
		const resBuild = await fn.build();
		t.not(resBuild.resWebpack, undefined, 'Webpack build result not UNDEFINED');
		t.not(resBuild.resVulcanize, undefined, 'Vulcanize build result not UNDEFINED');
		t.is(fs.existsSync(`${__dirname}/build-tmp/index.html`), true);
		t.is(fs.existsSync(`${__dirname}/build-tmp/bundle-test.js`), true);
		t.is(fs.existsSync(`${__dirname}/build-tmp/bundle-test.js.map`), true);
});

test('correct replace() method', async t => {
		const confWebpack = require('./src-test/webpack.test.config');
		const config = {
			workspace: './test/workspace',
			sourceApp: './test/src-test',
			buildFolder: './test/build-tmp',
			// OPTIONAL
			buildJS: 'bundle-test.js',
			manifest: true,
			vulcanize: {
				srcTarget: 'index.html',
				buildTarget: 'index.html',
				conf: {
					stripComments: true,
					inlineScripts: true,
					inlineStyles: true,
					excludes: [
						'javascript.js'
					]
				}
			},
			replace: {
		    css: {
					files: 'index.html',
					commentRegex: '<!--styles!--->((.|\n)*)<!--styles!--->',
					with: '/assets/style.css'
		    },
				 js: {
					files: 'index.html',
		 			commentRegex: '<!--js!--->((.|\n)*)<!--js!--->',
					with: '/assets/javascript.js'
				 }
		  }
		};
		const webpackConfig = confWebpack;
		const fn = new Fn(config, webpackConfig);
		const replRes = await fn.replace();
		const res = await fn.build();
		t.true(replRes);
});

test('correct minify() method', async t => {
		const confWebpack = require('./src-test/webpack.test.config');
		const config = {
			workspace: './test/workspace',
			sourceApp: './test/src-test',
			buildFolder: './test/build-tmp',
			assetsFolderName: 'assets',
			srcCSS: ['/test.css'],
			// OPTIONAL
			buildCSS: 'style.min.css',
			// OPTIONAL
			buildJS: 'bundle-test.js',
			vulcanize: {
				srcTarget: 'index.html',
				buildTarget: 'index.html',
				conf: {
					stripComments: true,
					inlineScripts: true,
					inlineStyles: true,
					excludes: [
						'js.js'
					]
				}
			},
		};
		const webpackConfig = confWebpack;
		const fn = new Fn(config, webpackConfig);
		const resBuild = await fn.build();
		const resMinify = await fn.minify();
		t.true(Array.isArray(resMinify));
});

test.afterEach.always(t => {
	console.log('AFTEREARCH HOOK');
  fs.removeSync('./test/build-tmp');
  fs.removeSync('./test/workspace');
});




// const kubo = new Kubozer(config)
