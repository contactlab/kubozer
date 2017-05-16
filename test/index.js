/* eslint "key-spacing": ["error", {"align": "colon"}] */

import path from 'path';
import fs   from 'fs-extra';
import test from 'ava';

import Kubozer       from '../dist';
import {SUCCESS_MSG} from '../dist/lib/hashed-resources';
import {
  merge,
  FOLDERS, VULCANIZE, VULCANIZE_NO_JS, VULCANIZE_NO_BUNDLE, COPY, REPLACE, MANIFEST, BUMP, CSS, STRIPCONSOLE
} from './helpers/config';

test('correct _createWorkspace when needed (build())', async t => {
  const config        = merge([FOLDERS, VULCANIZE]);
  const webpackConfig = require('./src-test/webpack.test.config');
  const kubozer       = new Kubozer(config, webpackConfig);

  await kubozer.build();

  t.true(await fs.pathExists(path.join(__dirname, 'workspace')), 'Worskpace created correctly on init');
});

test('correct deleteWorkspace()', async t => {
  const config        = merge([FOLDERS, VULCANIZE]);
  const webpackConfig = require('./src-test/webpack.test.config');
  const kubozer       = new Kubozer(config, webpackConfig);

  await kubozer.build();

  kubozer.deleteWorkspace();

  t.false(await fs.pathExists(path.join(__dirname, 'workspace')), 'Worskpace deleted correctly on init');
});

test('correct deletePrevBuild()', async t => {
  const pathToDir = path.join(__dirname, 'build');

  await fs.ensureDir(pathToDir);

  const webpackConfig = require('./src-test/webpack.test.config');
  const kubozer       = new Kubozer(FOLDERS, webpackConfig);

  kubozer.deletePrevBuild();

  t.false(await fs.pathExists(pathToDir), 'Correctly removed old build.');
});

test('correct copy() method', async t => {
  const config  = merge([FOLDERS, COPY, MANIFEST]);
  const kubozer = new Kubozer(config, {});

  await kubozer.copy('bundles');

  const buildDir = path.resolve(config.buildFolder);

  t.is(await fs.pathExists(path.join(buildDir, 'assets/imgs-others')), true);
  t.is(await fs.pathExists(path.join(buildDir, 'bundles')), true);
  t.is(await fs.pathExists(path.join(buildDir, 'manifest.json')), true, 'Manifest is correctly copied');
});

test('not thrown when manifest is NOT present during _copyManifest()', async t => {
  const manifest    = path.join(__dirname, 'src-test/manifest.json');
  const manifestBkp = path.join(__dirname, 'src-test/manifest.backup.json');

  await fs.copy(manifest, manifestBkp);
  await fs.remove(manifest);

  const config  = merge([FOLDERS, COPY, MANIFEST]);
  const kubozer = new Kubozer(config, {});

  await kubozer.copy();

  const buildDir = path.resolve(config.buildFolder);

  t.true(await fs.pathExists(path.join(buildDir, 'assets/imgs-others')));
  t.true(await fs.pathExists(path.join(buildDir, 'bundles')));
  t.false(await fs.pathExists(path.join(buildDir, 'manifest.json')), 'Manifest is correctly NOT copied and no errors thrown');

  await fs.copy(manifestBkp, manifest);
  await fs.remove(manifestBkp);
});

test('correct replace() method', async t => {
  const config        = merge([FOLDERS, VULCANIZE_NO_JS, REPLACE, MANIFEST]);
  const webpackConfig = require('./src-test/webpack.test.config');
  const kubozer       = new Kubozer(config, webpackConfig);
  const replRes       = await kubozer.replace();

  await kubozer.build();

  t.is(replRes.err, undefined);
  t.true(Array.isArray(replRes.data.changedCSS));
  t.true(Array.isArray(replRes.data.changedJS));
});

test('replace() products correct output', async t => {
  const config        = merge([FOLDERS, VULCANIZE_NO_JS, REPLACE, MANIFEST]);
  const webpackConfig = require('./src-test/webpack.test.config');
  const kubozer       = new Kubozer(config, webpackConfig);

  await kubozer.replace();
  await kubozer.build();

  const fileReplace = await fs.readFile(path.resolve(config.buildFolder, 'index.html'), 'utf8');

  // eslint-disable-next-line no-useless-escape
  t.is(fileReplace, `<!DOCTYPE html><html><head>\n    <meta charset=\"utf-8\">\n    <title></title>\n\n      \n        <link rel=\"stylesheet\" href=\"/assets/style.css\">\n        \n\n      \n        <script src=\"/assets/javascript.js\"></script>\n        \n\n  </head>\n  <body>\n\n  \n\n</body></html>`);
});

test('correct bump() method', async t => {
  const config     = merge([FOLDERS, BUMP]);
  const srcTestDir = path.resolve(config.sourceFolder);

  await fs.writeFile(path.join(srcTestDir, 'package.json'), JSON.stringify({version: '1.0.0'}));
  await fs.writeFile(path.join(srcTestDir, 'manifest.json'), JSON.stringify({version: '1.0.0'}));

  const webpackConfig = require('./src-test/webpack.test.config');
  const kubozer       = new Kubozer(config, webpackConfig);
  const resBump       = await kubozer.bump('major');

  t.false(await fs.pathExists(config.workspace), 'workspace correctly not created during the bump task');
  t.true(Array.isArray(resBump.data));
  t.is(resBump.data[0].version, '2.0.0');
});

test('correct build() method', async t => {
  const config        = merge([FOLDERS, VULCANIZE_NO_BUNDLE, MANIFEST]);
  const webpackConfig = require('./src-test/webpack.test.config');
  const kubozer       = new Kubozer(config, webpackConfig);
  const buildDir      = path.resolve(config.buildFolder);
  const resBuild      = await kubozer.build();

  t.not(resBuild.resWebpack, undefined, 'Webpack build result not UNDEFINED');
  t.not(resBuild.resVulcanize, undefined, 'Vulcanize build result not UNDEFINED');

  t.true(await fs.pathExists(path.join(buildDir, 'index.html')));
  t.true(await fs.pathExists(path.join(buildDir, 'bundle.js')));
  t.true(await fs.pathExists(path.join(buildDir, 'bundle.js.map')));
});

test('correct build() with minify method without stripConsole', async t => {
  const config        = merge([FOLDERS, VULCANIZE_NO_BUNDLE, MANIFEST, CSS]);
  const webpackConfig = require('./src-test/webpack.test.config');
  const kubozer       = new Kubozer(config, webpackConfig);
  const buildDir      = path.resolve(config.buildFolder);
  const resBuild      = await kubozer.build(true);

  const {output}       = webpackConfig;
  const bundleFileBase = path.basename(output.filename, '.js');
  const styleFileBae   = path.basename(config.buildCssFile, '.css');

  t.not(resBuild.resWebpack, undefined, 'Webpack build result not UNDEFINED');
  t.is(resBuild.resVulcanize.data, `${__dirname}/build/index.html`, 'Vulcanize data build result correct');
  t.is(resBuild.resVulcanize.message, 'Vulcanize completed.', 'Vulcanize message build result correct');
  t.is(resBuild.resMinifiedCss, 'test{font-size:10px}', 'Vulcanize build result correct');
  t.is(resBuild.resHashed.message, SUCCESS_MSG, 'hashing resources should work fine');

  t.true(await fs.pathExists(path.join(buildDir, 'index.html')), 'index.html should exist in build dir');

  const filesInBuildDir = await fs.readdir(buildDir);
  const bundleFile      = filesInBuildDir.filter(f => f.indexOf(bundleFileBase) === 0)[0];

  t.truthy(bundleFile, 'bundle should exist in build dir');

  const filesInAssetsDir = await fs.readdir(path.join(buildDir, config.assetsFolder));
  const styleFile        = filesInAssetsDir.filter(f => f.indexOf(styleFileBae) === 0)[0];

  t.truthy(styleFile, 'style.min should exist in build dir');

  const bundleContent = await fs.readFile(path.join(buildDir, bundleFile), 'utf8');
  t.true(bundleContent.includes('console.log'), 'should not strip "console.log" away');
});

test('correct build() with minify method and stripConsole', async t => {
  const config        = merge([FOLDERS, VULCANIZE_NO_BUNDLE, MANIFEST, CSS, STRIPCONSOLE]);
  const webpackConfig = require('./src-test/webpack.test.config');
  const kubozer       = new Kubozer(config, webpackConfig);
  const buildDir      = path.resolve(config.buildFolder);
  const resBuild      = await kubozer.build(true);

  const {output}       = webpackConfig;
  const bundleFileBase = path.basename(output.filename, '.js');
  const styleFileBae   = path.basename(config.buildCssFile, '.css');

  t.not(resBuild.resWebpack, undefined, 'Webpack build result not UNDEFINED');
  t.is(resBuild.resVulcanize.data, `${__dirname}/build/index.html`, 'Vulcanize data build result correct');
  t.is(resBuild.resVulcanize.message, 'Vulcanize completed.', 'Vulcanize message build result correct');
  t.is(resBuild.resMinifiedCss, 'test{font-size:10px}', 'Vulcanize build result correct');
  t.is(resBuild.resHashed.message, SUCCESS_MSG, 'hashing resources should work fine');

  t.true(await fs.pathExists(path.join(buildDir, 'index.html')), 'index.html should exist in build dir');

  const filesInBuildDir = await fs.readdir(buildDir);
  const bundleFile      = filesInBuildDir.filter(f => f.indexOf(bundleFileBase) === 0)[0];

  t.truthy(bundleFile, 'bundle should exist in build dir');

  const filesInAssetsDir = await fs.readdir(path.join(buildDir, config.assetsFolder));
  const styleFile        = filesInAssetsDir.filter(f => f.indexOf(styleFileBae) === 0)[0];

  t.truthy(styleFile, 'style.min should exist in build dir');

  const bundleContent = await fs.readFile(path.join(buildDir, bundleFile), 'utf8');
  t.false(bundleContent.includes('console.log'), 'should strip "console.log" away');
});

test('correct build() when webpack entry is an object', async t => {
  const webpackConfig = require('./src-test/webpack.test.config');
  webpackConfig.entry = {
    main   : webpackConfig.entry,
    vendors: ['ava']
  };
  webpackConfig.output.filename = '[name].bundle.js';

  const config   = merge([FOLDERS, VULCANIZE_NO_BUNDLE, MANIFEST]);
  const kubozer  = new Kubozer(config, webpackConfig);
  const buildDir = path.resolve(config.buildFolder);
  const resBuild = await kubozer.build();

  t.not(resBuild.resWebpack, undefined, 'Webpack build result not UNDEFINED');
  t.not(resBuild.resVulcanize, undefined, 'Vulcanize build result not UNDEFINED');

  t.true(await fs.pathExists(path.join(buildDir, 'index.html')));
  t.true(await fs.pathExists(path.join(buildDir, 'main.bundle.js')));
  t.true(await fs.pathExists(path.join(buildDir, 'vendors.bundle.js')));
});

test.afterEach.always(async () => {
  await fs.remove(path.join('test', 'build'));
  await fs.remove(path.join('test', 'workspace'));
});
