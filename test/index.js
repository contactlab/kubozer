import fs from 'fs-extra';
import test from 'ava';
import Fn from './../dist/index';


test('correct _createWorkspace when needed (build())', async t => {
	const confWebpack = require('./src-test/webpack.test.config');
	// Create the build folder
	const pathToDir = `${__dirname}/workspace`;
	const config = {
		workspace: './test/workspace',
		sourceApp: './test/src-test',
		buildFolder: './test/build-tmp',
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
	const webpackConfig = confWebpack;
	const fn = new Fn(config, webpackConfig);
	const res = await fn.build();
	t.true(fs.existsSync(pathToDir), 'Worskpace created correctly on init');
});

test('correct deleteWorkspace()', async t => {
	const confWebpack = require('./src-test/webpack.test.config');
	// Create the build folder
	const pathToDir = `${__dirname}/workspace`;
	const config = {
		workspace: './test/workspace',
		sourceApp: './test/src-test',
		buildFolder: './test/build-tmp',
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
	const webpackConfig = confWebpack;
	const fn = new Fn(config, webpackConfig);
	const res = await fn.build();
	fn.deleteWorkspace();
	t.false(fs.existsSync(pathToDir), 'Worskpace deleted correctly on init');
});

test('correct deletePrevBuild()', t => {
	const confWebpack = require('./src-test/webpack.test.config');
	// Create the build folder
	const pathToDir = `${__dirname}/build-tmp`;
	fs.ensureDirSync(pathToDir);

	const config = {
		workspace: './test/workspace',
		sourceApp: './test/src-test',
		buildFolder: './test/build-tmp'
	};
	const webpackConfig = confWebpack;
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

test('correct build() when webpack entry is an object', async t => {
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
	webpackConfig.entry = {
		main: webpackConfig.entry,
		vendors: ['ava']
	}
	const fn = new Fn(config, webpackConfig);
	const resBuild = await fn.build();
	t.is(resBuild, 'ciao');
	t.not(resBuild.resWebpack, undefined, 'Webpack build result not UNDEFINED');
	t.not(resBuild.resVulcanize, undefined, 'Vulcanize build result not UNDEFINED');
	t.is(fs.existsSync(`${__dirname}/build-tmp/index.html`), true);
	t.is(fs.existsSync(`${__dirname}/build-tmp/bundle-test.js`), true);
	t.is(fs.existsSync(`${__dirname}/build-tmp/bundle-test.js.map`), true);
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
				commentRegex: ['<!--styles!--->((.|\n)*)<!--styles!--->'],
				with: ['/assets/style.css']
			},
			 js: {
				files: 'index.html',
				commentRegex: ['<!--js!--->((.|\n)*)<!--js!--->'],
				with: ['/assets/javascript.js']
			 }
		}
	};
	const webpackConfig = confWebpack;
	const fn = new Fn(config, webpackConfig);
	const replRes = await fn.replace();
	const res = await fn.build();
	t.is(replRes.err, undefined);
	t.true(Array.isArray(replRes.data.changedCSS));
	t.true(Array.isArray(replRes.data.changedJS));
});

test('replace() products correct output', async t => {
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
				commentRegex: ['<!--styles!--->((.|\n)*)<!--styles!--->'],
				with: ['/assets/style.css']
			},
			 js: {
				files: 'index.html',
				commentRegex: ['<!--js!--->((.|\n)*)<!--js!--->'],
				with: ['/assets/javascript.js']
			 }
		}
	};
	const webpackConfig = confWebpack;
	const fn = new Fn(config, webpackConfig);
	const replRes = await fn.replace();
	const res = await fn.build();
	const fileReplace = fs.readFileSync(`${__dirname}/build-tmp/index.html`, 'utf8');
	t.is(fileReplace, `<!DOCTYPE html><html><head>\n\t\t<meta charset=\"utf-8\">\n\t\t<title></title>\n\n\t\t\t\n\t\t\t\t<link rel=\"stylesheet\" href=\"/assets/style.css\">\n\t\t\t\t\n\n\t\t\t\n\t\t\t\t<script src=\"/assets/javascript.js\"></script>\n\t\t\t\t\n\n\t</head>\n\t<body>\n\n\t\n\n</body></html>`);
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

test('correct bump() method', async t => {
	fs.writeFileSync('./test/src-test/package.json', JSON.stringify({version: '1.0.0'}))
	fs.writeFileSync('./test/src-test/manifest.json', JSON.stringify({version: '1.0.0'}))
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
	const resBump = await fn.bump('major');
	// Check if workspace was NOT created correclty
	t.false(fs.existsSync(config.workspace), 'workspace correctly not created during the bump task');
	t.true(Array.isArray(resBump.data));
	t.is(resBump.data[0].version, '2.0.0');
});

test.afterEach.always(t => {
	fs.removeSync('./test/build-tmp');
	fs.removeSync('./test/workspace');
});
