/* eslint "key-spacing": ["error", {"align": "colon"}] */

import path   from 'path';
import fs     from 'fs-extra';
import test   from 'ava';

import Kubozer       from '../dist';
import {SUCCESS_MSG} from '../dist/lib/hashed-resources';
import tmpDir        from './helpers/tmp-dir';
import hconf         from './helpers/config';

test.beforeEach(async t => {
  // eslint-disable-next-line ava/use-t-well
  const workDir = await tmpDir(path.join(__dirname, 'integration/src'), t.title);

  t.context.tmpDir = workDir;
  t.context.webpackConfig = require(path.join(workDir, 'src/webpack.test.config'));
});

test('correct _createWorkspace when needed (build())', async t => {
  const {tmpDir, webpackConfig} = t.context;
  const config                  = hconf(tmpDir, ['FOLDERS', 'VULCANIZE']);
  const kubozer                 = new Kubozer(config, webpackConfig);

  await kubozer.build();

  t.true(await fs.pathExists(config.workspace), 'Worskpace created correctly on init');
});

test('correct deleteWorkspace()', async t => {
  const {tmpDir, webpackConfig} = t.context;
  const config                  = hconf(tmpDir, ['FOLDERS', 'VULCANIZE']);
  const kubozer                 = new Kubozer(config, webpackConfig);

  await kubozer.build();

  kubozer.deleteWorkspace();

  t.false(await fs.pathExists(config.workspace), 'Worskpace deleted correctly on init');
});

test('correct deletePrevBuild()', async t => {
  const {tmpDir, webpackConfig} = t.context;
  const pathToDir               = path.join(tmpDir, 'build');

  await fs.ensureDir(pathToDir);

  const config  = hconf(tmpDir, ['FOLDERS']);
  const kubozer = new Kubozer(config, webpackConfig);

  kubozer.deletePrevBuild();

  t.false(await fs.pathExists(pathToDir), 'Correctly removed old build.');
});

test('correct copy() method', async t => {
  const config  = hconf(t.context.tmpDir, ['FOLDERS', 'COPY', 'MANIFEST']);
  const kubozer = new Kubozer(config, {});

  await kubozer.copy('bundles');

  const buildDir = path.resolve(config.buildFolder);

  t.is(await fs.pathExists(path.join(buildDir, 'assets/imgs-others')), true);
  t.is(await fs.pathExists(path.join(buildDir, 'bundles')), true);
  t.is(await fs.pathExists(path.join(buildDir, 'manifest.json')), true, 'Manifest is correctly copied');
});

test('not thrown when manifest is NOT present during _copyManifest()', async t => {
  const manifest    = path.join(t.context.tmpDir, 'src/manifest.json');
  const manifestBkp = path.join(t.context.tmpDir, 'src/manifest.backup.json');

  await fs.copy(manifest, manifestBkp);
  await fs.remove(manifest);

  const config  = hconf(t.context.tmpDir, ['FOLDERS', 'COPY', 'MANIFEST']);
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
  const {tmpDir, webpackConfig} = t.context;
  const config                  = hconf(tmpDir, ['FOLDERS', 'VULCANIZE_NO_JS', 'REPLACE', 'MANIFEST']);
  const kubozer                 = new Kubozer(config, webpackConfig);
  const replRes                 = await kubozer.replace();

  await kubozer.build();

  t.is(replRes.err, undefined);
  t.true(Array.isArray(replRes.data.changedCSS));
  t.true(Array.isArray(replRes.data.changedJS));
});

test('replace() products correct output', async t => {
  const {tmpDir, webpackConfig} = t.context;
  const config                  = hconf(tmpDir, ['FOLDERS', 'VULCANIZE_NO_JS', 'REPLACE', 'MANIFEST']);
  const kubozer                 = new Kubozer(config, webpackConfig);

  await kubozer.replace();
  await kubozer.build();

  const fileReplace = await fs.readFile(path.resolve(config.buildFolder, 'index.html'), 'utf8');

  // eslint-disable-next-line no-useless-escape
  t.is(fileReplace, `<!DOCTYPE html><html><head>\n    <meta charset=\"utf-8\">\n    <title></title>\n\n      \n        <link rel=\"stylesheet\" href=\"/assets/style.css\">\n        \n\n      \n        <script src=\"/assets/javascript.js\"></script>\n        \n\n  </head>\n  <body>\n\n  \n\n</body></html>`);
});

test('when running replace() the "replace" property of configuration is not mandatory', async t => {
  const {tmpDir, webpackConfig} = t.context;
  const config                  = hconf(tmpDir, ['FOLDERS', 'VULCANIZE_NO_JS', 'MANIFEST']);
  const kubozer                 = new Kubozer(config, webpackConfig);

  const res = await kubozer.replace();
  t.deepEqual(res.data.changedCSS, []);
  t.deepEqual(res.data.changedJS, []);
  t.is(res.message, 'Replace-in-file completed.');
  t.is(res.error, undefined);
});

test('correct bump() method', async t => {
  const {tmpDir, webpackConfig} = t.context;
  const config                  = hconf(tmpDir, ['FOLDERS', 'BUMP']);

  await fs.writeFile(path.join(config.sourceFolder, 'package.json'), JSON.stringify({version: '1.0.0'}));
  await fs.writeFile(path.join(config.sourceFolder, 'manifest.json'), JSON.stringify({version: '1.0.0'}));

  const kubozer = new Kubozer(config, webpackConfig);
  const resBump = await kubozer.bump('major');

  t.false(await fs.pathExists(config.workspace), 'workspace correctly not created during the bump task');
  t.true(Array.isArray(resBump.data));
  t.is(resBump.data[0].version, '2.0.0');
});

test('correct build() method', async t => {
  const {tmpDir, webpackConfig} = t.context;
  const config                  = hconf(tmpDir, ['FOLDERS', 'VULCANIZE_NO_BUNDLE', 'MANIFEST']);
  const kubozer                 = new Kubozer(config, webpackConfig);
  const resBuild                = await kubozer.build();

  t.not(resBuild.resWebpack, undefined, 'Webpack build result not UNDEFINED');
  t.not(resBuild.resVulcanize, undefined, 'Vulcanize build result not UNDEFINED');

  t.true(await fs.pathExists(path.join(config.buildFolder, 'index.html')));
  t.true(await fs.pathExists(path.join(config.buildFolder, 'bundle.js')));
  t.true(await fs.pathExists(path.join(config.buildFolder, 'bundle.js.map')));
});

test('correct build() with minify method without stripConsole', async t => {
  const {tmpDir, webpackConfig} = t.context;
  const config                  = hconf(tmpDir, ['FOLDERS', 'VULCANIZE_NO_BUNDLE', 'MANIFEST', 'CSS']);
  const kubozer                 = new Kubozer(config, webpackConfig);
  const resBuild                = await kubozer.build(true);

  const {output}       = webpackConfig;
  const bundleFileBase = path.basename(output.filename, '.js');
  const styleFileBae   = path.basename(config.buildCssFile, '.css');

  t.not(resBuild.resWebpack, undefined, 'Webpack build result not UNDEFINED');
  t.is(resBuild.resVulcanize.data, path.join(config.buildFolder, 'index.html'), 'Vulcanize data build result correct');
  t.is(resBuild.resVulcanize.message, 'Vulcanize completed.', 'Vulcanize message build result correct');
  t.is(resBuild.resMinifiedCss, 'test{font-size:10px}', 'Vulcanize build result correct');
  t.is(resBuild.resHashed.message, SUCCESS_MSG, 'hashing resources should work fine');

  t.true(await fs.pathExists(path.join(config.buildFolder, 'index.html')), 'index.html should exist in build dir');

  const filesInBuildDir = await fs.readdir(config.buildFolder);
  const bundleFile      = filesInBuildDir.filter(f => f.indexOf(bundleFileBase) === 0)[0];

  t.truthy(bundleFile, 'bundle should exist in build dir');

  const filesInAssetsDir = await fs.readdir(path.join(config.buildFolder, config.assetsFolder));
  const styleFile        = filesInAssetsDir.filter(f => f.indexOf(styleFileBae) === 0)[0];

  t.truthy(styleFile, 'style.min should exist in build dir');

  const bundleContent = await fs.readFile(path.join(config.buildFolder, bundleFile), 'utf8');
  t.true(bundleContent.includes('console.log'), 'should not strip "console.log" away');
});

test('correct build() with minify method and stripConsole', async t => {
  const {tmpDir, webpackConfig} = t.context;
  const config                  = hconf(tmpDir, ['FOLDERS', 'VULCANIZE_NO_BUNDLE', 'MANIFEST', 'CSS', 'STRIPCONSOLE']);
  const kubozer                 = new Kubozer(config, webpackConfig);
  const resBuild                = await kubozer.build(true);

  const {output}       = webpackConfig;
  const bundleFileBase = path.basename(output.filename, '.js');
  const styleFileBae   = path.basename(config.buildCssFile, '.css');

  t.not(resBuild.resWebpack, undefined, 'Webpack build result not UNDEFINED');
  t.is(resBuild.resVulcanize.data, path.join(config.buildFolder, 'index.html'), 'Vulcanize data build result correct');
  t.is(resBuild.resVulcanize.message, 'Vulcanize completed.', 'Vulcanize message build result correct');
  t.is(resBuild.resMinifiedCss, 'test{font-size:10px}', 'Vulcanize build result correct');
  t.is(resBuild.resHashed.message, SUCCESS_MSG, 'hashing resources should work fine');

  t.true(await fs.pathExists(path.join(config.buildFolder, 'index.html')), 'index.html should exist in build dir');

  const filesInBuildDir = await fs.readdir(config.buildFolder);
  const bundleFile      = filesInBuildDir.filter(f => f.indexOf(bundleFileBase) === 0)[0];

  t.truthy(bundleFile, 'bundle should exist in build dir');

  const filesInAssetsDir = await fs.readdir(path.join(config.buildFolder, config.assetsFolder));
  const styleFile        = filesInAssetsDir.filter(f => f.indexOf(styleFileBae) === 0)[0];

  t.truthy(styleFile, 'style.min should exist in build dir');

  const bundleContent = await fs.readFile(path.join(config.buildFolder, bundleFile), 'utf8');
  t.false(bundleContent.includes('console.log'), 'should strip "console.log" away');
});

test('correct build() when webpack entry is an object', async t => {
  const {tmpDir, webpackConfig} = t.context;
  const config                  = hconf(tmpDir, ['FOLDERS', 'VULCANIZE_NO_BUNDLE', 'MANIFEST']);

  webpackConfig.entry = {
    main   : webpackConfig.entry,
    vendors: ['babel-cli']
  };
  webpackConfig.output.filename = '[name].bundle.js';

  const kubozer  = new Kubozer(config, webpackConfig);
  const resBuild = await kubozer.build();

  t.not(resBuild.resWebpack, undefined, 'Webpack build result not UNDEFINED');
  t.not(resBuild.resVulcanize, undefined, 'Vulcanize build result not UNDEFINED');

  t.true(await fs.pathExists(path.join(config.buildFolder, 'index.html')));
  t.true(await fs.pathExists(path.join(config.buildFolder, 'main.bundle.js')));
  t.true(await fs.pathExists(path.join(config.buildFolder, 'vendors.bundle.js')));
});

test.afterEach.always(async t => {
  await fs.remove(t.context.tmpDir);
});
