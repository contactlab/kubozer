import fs from 'fs-extra';
import test from 'ava';
import Fn from './../dist/index';


test('correct _createWorkspace when needed (build())', async t => {
	const confWebpack = require('./src-test/webpack.test.config');
	// Create the build folder
	const pathToDir = `${__dirname}/workspace`;
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
	const webpackConfig = confWebpack;
	const fn = new Fn(config, webpackConfig);
	const res = await fn.build();
	fn.deleteWorkspace();
	t.false(fs.existsSync(pathToDir), 'Worskpace deleted correctly on init');
});

test('correct deletePrevBuild()', t => {
	const confWebpack = require('./src-test/webpack.test.config');
	// Create the build folder
	const pathToDir = `${__dirname}/build`;
	fs.ensureDirSync(pathToDir);

	const config = {
		workspace: './test/workspace',
		sourceFolder: './test/src-test',
		buildFolder: './test/build'
	};
	const webpackConfig = confWebpack;
	const fn = new Fn(config, webpackConfig);
	fn.deletePrevBuild();
	t.false(fs.existsSync(pathToDir), 'Correctly removed old build.');
});

test('correct copy() method', async t => {
	const config = {
		workspace: './test/workspace',
		sourceFolder: './test/src-test',
		buildFolder: './test/build',
		manifest: true,
		copy: [
			{
				baseFolder: 'assets',
				items: [
					'imgs-others'
				]
			}, {
				baseFolder: 'bundles',
				items: [
					''
				]
			}
		]

	};
	const webpackConfig = {};
	const fn = new Fn(config, webpackConfig);
	const copiedBundles = await fn.copy('bundles');
	t.is(fs.existsSync(`${__dirname}/build/assets/imgs-others`), true);
	t.is(fs.existsSync(`${__dirname}/build/bundles`), true);
	t.is(fs.existsSync(`${__dirname}/build/manifest.json`), true, 'Manifest is correctly copied');
});

test('not thrown when manifest is NOT present during _copyManifest()', async t => {
	fs.copySync(__dirname + '/src-test/manifest.json', __dirname + '/src-test/manifest.backup.json');
	fs.removeSync(__dirname + '/src-test/manifest.json');
	const config = {
		workspace: './test/workspace',
		sourceFolder: './test/src-test',
		buildFolder: './test/build',
		manifest: true,
		copy: [
			{
				baseFolder: 'assets',
				items: [
					'imgs-others'
				]
			}, {
				baseFolder: 'bundles',
				items: [
					''
				]
			}
		]

	};
	const webpackConfig = {};
	const fn = new Fn(config, webpackConfig);
	const copiedBundles = await fn.copy();
	t.is(fs.existsSync(`${__dirname}/build/assets/imgs-others`), true);
	t.is(fs.existsSync(`${__dirname}/build/bundles`), true);
	t.is(fs.existsSync(`${__dirname}/build/manifest.json`), false, 'Manifest is correctly NOT copied and no errors thrown');
	fs.copySync(__dirname + '/src-test/manifest.backup.json', __dirname + '/src-test/manifest.json');
	fs.removeSync(__dirname + '/src-test/manifest.backup.json');
});

test('correct replace() method', async t => {
	const confWebpack = require('./src-test/webpack.test.config');
	const config = {
		workspace: './test/workspace',
		sourceFolder: './test/src-test',
		buildFolder: './test/build',
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
		sourceFolder: './test/src-test',
		buildFolder: './test/build',
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
	const fileReplace = fs.readFileSync(`${__dirname}/build/index.html`, 'utf8');
	t.is(fileReplace, `<!DOCTYPE html><html><head>\n\t\t<meta charset=\"utf-8\">\n\t\t<title></title>\n\n\t\t\t\n\t\t\t\t<link rel=\"stylesheet\" href=\"/assets/style.css\">\n\t\t\t\t\n\n\t\t\t\n\t\t\t\t<script src=\"/assets/javascript.js\"></script>\n\t\t\t\t\n\n\t</head>\n\t<body>\n\n\t\n\n</body></html>`);
});

test('correct bump() method', async t => {
	fs.writeFileSync('./test/src-test/package.json', JSON.stringify({version: '1.0.0'}))
	fs.writeFileSync('./test/src-test/manifest.json', JSON.stringify({version: '1.0.0'}))
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
	const resBump = await fn.bump('major');
	// Check if workspace was NOT created correclty
	t.false(fs.existsSync(config.workspace), 'workspace correctly not created during the bump task');
	t.true(Array.isArray(resBump.data));
	t.is(resBump.data[0].version, '2.0.0');
});

test('correct build() method', async t => {
	const confWebpack = require('./src-test/webpack.test.config');
	const config = {
		workspace: './test/workspace',
		sourceFolder: './test/src-test',
		buildFolder: './test/build',
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
	t.is(fs.existsSync(`${__dirname}/build/index.html`), true);
	t.is(fs.existsSync(`${__dirname}/build/bundle.js`), true);
	t.is(fs.existsSync(`${__dirname}/build/bundle.js.map`), true);
});

test('correct build() with minify method', async t => {
	const confWebpack = require('./src-test/webpack.test.config');
	const config = {
		workspace: './test/workspace',
		sourceFolder: './test/src-test',
		buildFolder: './test/build',
		assetsFolder: 'assets',
		sourceCssFiles: ['/test.css'],
		buildCssFile: 'style.min.css',
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
	const minify = true;
	const resBuild = await fn.build(minify);
	t.not(resBuild.resWebpack, undefined, 'Webpack build result not UNDEFINED');
	t.is(resBuild.resVulcanize.data, `${__dirname}/build/index.html`, 'Vulcanize data build result correct');
	t.is(resBuild.resVulcanize.message, 'Vulcanize completed.', 'Vulcanize message build result correct');
	t.is(resBuild.resMinifiedCss, 'test{font-size:10px}', 'Vulcanize build result correct');
	t.is(fs.existsSync(`${__dirname}/build/index.html`), true);
	t.is(fs.existsSync(`${__dirname}/build/bundle.js`), true);
	t.is(fs.existsSync(`${__dirname}/build/assets/style.min.css`), true);
});

test('correct build() when webpack entry is an object', async t => {
	const confWebpack = require('./src-test/webpack.test.config');
	const config = {
		workspace: './test/workspace',
		sourceFolder: './test/src-test',
		buildFolder: './test/build',
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
	};
	webpackConfig.output.filename = '[name].bundle.js';
	const fn = new Fn(config, webpackConfig);
	const resBuild = await fn.build();
	t.not(resBuild.resWebpack, undefined, 'Webpack build result not UNDEFINED');
	t.not(resBuild.resVulcanize, undefined, 'Vulcanize build result not UNDEFINED');
	t.is(fs.existsSync(`${__dirname}/build/index.html`), true);
	t.is(fs.existsSync(`${__dirname}/build/main.bundle.js`), true);
	t.is(fs.existsSync(`${__dirname}/build/vendors.bundle.js`), true);
});

test.afterEach.always(t => {
	fs.removeSync('./test/build');
	fs.removeSync('./test/workspace');
});
