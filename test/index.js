import path from 'path';
import fs   from 'fs-extra';
import test from 'ava';
import pify from 'pify';

import {SUCCESS_MSG} from '../dist/lib/hashed-resources';
import Fn            from './../dist/index';

test('correct _createWorkspace when needed (build())', async t => {
  // Create the build folder
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
  const webpackConfig = require('./src-test/webpack.test.config');
  const fn            = new Fn(config, webpackConfig);
  const res           = await fn.build();

  t.true(fs.existsSync(path.join(__dirname, 'workspace')), 'Worskpace created correctly on init');
});

test('correct deleteWorkspace()', async t => {
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

  const webpackConfig = require('./src-test/webpack.test.config');
  const fn            = new Fn(config, webpackConfig);
  const res           = await fn.build();

  fn.deleteWorkspace();

  t.false(fs.existsSync(path.join(__dirname, 'workspace')), 'Worskpace deleted correctly on init');
});

test('correct deletePrevBuild()', t => {
  const pathToDir = path.join(__dirname, 'build');

  fs.ensureDirSync(pathToDir);

  const config = {
    workspace: './test/workspace',
    sourceFolder: './test/src-test',
    buildFolder: './test/build'
  };

  const webpackConfig = require('./src-test/webpack.test.config');
  const fn            = new Fn(config, webpackConfig);

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

  const fn            = new Fn(config, {});
  const copiedBundles = await fn.copy('bundles');
  const buildDir      = path.resolve(config.buildFolder);

  t.is(fs.existsSync(path.join(buildDir, 'assets/imgs-others')), true);
  t.is(fs.existsSync(path.join(buildDir, 'bundles')), true);
  t.is(fs.existsSync(path.join(buildDir, 'manifest.json')), true, 'Manifest is correctly copied');
});

test('not thrown when manifest is NOT present during _copyManifest()', async t => {
  const manifest    = path.join(__dirname, 'src-test/manifest.json');
  const manifestBkp = path.join(__dirname, 'src-test/manifest.backup.json');

  fs.copySync(manifest, manifestBkp);
  fs.removeSync(manifest);

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

  const fn            = new Fn(config, {});
  const copiedBundles = await fn.copy();
  const buildDir      = path.resolve(config.buildFolder);

  t.is(fs.existsSync(path.join(buildDir, 'assets/imgs-others')), true);
  t.is(fs.existsSync(path.join(buildDir, 'bundles')), true);
  t.is(fs.existsSync(path.join(buildDir, 'manifest.json')), false, 'Manifest is correctly NOT copied and no errors thrown');

  fs.copySync(manifestBkp, manifest);
  fs.removeSync(manifestBkp);
});

test('correct replace() method', async t => {
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

  const webpackConfig = require('./src-test/webpack.test.config');
  const fn            = new Fn(config, webpackConfig);
  const replRes       = await fn.replace();
  const res           = await fn.build();

  t.is(replRes.err, undefined);
  t.true(Array.isArray(replRes.data.changedCSS));
  t.true(Array.isArray(replRes.data.changedJS));
});

test('replace() products correct output', async t => {
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

  const webpackConfig = require('./src-test/webpack.test.config');
  const fn            = new Fn(config, webpackConfig);
  const replRes       = await fn.replace();
  const res           = await fn.build();
  const fileReplace   = fs.readFileSync(path.resolve(config.buildFolder, 'index.html'), 'utf8');

  // eslint-disable-next-line no-useless-escape
  t.is(fileReplace, `<!DOCTYPE html><html><head>\n    <meta charset=\"utf-8\">\n    <title></title>\n\n      \n        <link rel=\"stylesheet\" href=\"/assets/style.css\">\n        \n\n      \n        <script src=\"/assets/javascript.js\"></script>\n        \n\n  </head>\n  <body>\n\n  \n\n</body></html>`);
});

test('correct bump() method', async t => {
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

  const srcTestDir = path.resolve(config.sourceFolder);
  fs.writeFileSync(path.join(srcTestDir, 'package.json'), JSON.stringify({version: '1.0.0'}));
  fs.writeFileSync(path.join(srcTestDir, 'manifest.json'), JSON.stringify({version: '1.0.0'}));

  const webpackConfig = require('./src-test/webpack.test.config');
  const fn            = new Fn(config, webpackConfig);
  const resBump       = await fn.bump('major');

  t.false(fs.existsSync(config.workspace), 'workspace correctly not created during the bump task');
  t.true(Array.isArray(resBump.data));
  t.is(resBump.data[0].version, '2.0.0');
});

test('correct build() method', async t => {
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

  const webpackConfig = require('./src-test/webpack.test.config');
  const fn            = new Fn(config, webpackConfig);
  const resBuild      = await fn.build();
  const buildDir      = path.resolve(config.buildFolder);

  t.not(resBuild.resWebpack, undefined, 'Webpack build result not UNDEFINED');
  t.not(resBuild.resVulcanize, undefined, 'Vulcanize build result not UNDEFINED');

  t.is(fs.existsSync(path.join(buildDir, 'index.html')), true);
  t.is(fs.existsSync(path.join(buildDir, 'bundle.js')), true);
  t.is(fs.existsSync(path.join(buildDir, 'bundle.js.map')), true);
});

test('correct build() with minify method without stripConsole', async t => {
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

  const webpackConfig = require('./src-test/webpack.test.config');
  const fn            = new Fn(config, webpackConfig);
  const resBuild      = await fn.build(true);
  const buildDir      = path.resolve(config.buildFolder);

  const {output}       = webpackConfig;
  const bundleFileBase = path.basename(output.filename, '.js');
  const styleFileBae   = path.basename(config.buildCssFile, '.css');

  t.not(resBuild.resWebpack, undefined, 'Webpack build result not UNDEFINED');
  t.is(resBuild.resVulcanize.data, `${__dirname}/build/index.html`, 'Vulcanize data build result correct');
  t.is(resBuild.resVulcanize.message, 'Vulcanize completed.', 'Vulcanize message build result correct');
  t.is(resBuild.resMinifiedCss, 'test{font-size:10px}', 'Vulcanize build result correct');
  t.is(resBuild.resHashed.message, SUCCESS_MSG, 'hashing resources should work fine');

  t.true(await fs.pathExists(path.join(buildDir, 'index.html')), 'index.html should exist in build dir');

  const filesInBuildDir = await pify(fs.readdir)(buildDir);
  const bundleFile      = filesInBuildDir.filter(f => f.indexOf(bundleFileBase) === 0)[0];

  t.truthy(bundleFile, 'bundle should exist in build dir');

  const filesInAssetsDir = await pify(fs.readdir)(path.join(buildDir, config.assetsFolder));
  const styleFile        = filesInAssetsDir.filter(f => f.indexOf(styleFileBae) === 0)[0];

  t.truthy(styleFile, 'style.min should exist in build dir');

  const bundleContent = await pify(fs.readFile)(path.join(buildDir, bundleFile), 'utf8');
  t.true(bundleContent.includes('console.log'), 'should not strip "console.log" away');
});

test('correct build() with minify method and stripConsole', async t => {
  const config = {
    workspace: './test/workspace',
    sourceFolder: './test/src-test',
    buildFolder: './test/build',
    assetsFolder: 'assets',
    sourceCssFiles: ['/test.css'],
    buildCssFile: 'style.min.css',
    manifest: true,
    stripConsole: true,
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

  const webpackConfig = require('./src-test/webpack.test.config');
  const fn            = new Fn(config, webpackConfig);
  const resBuild      = await fn.build(true);
  const buildDir      = path.resolve(config.buildFolder);

  const {output}       = webpackConfig;
  const bundleFileBase = path.basename(output.filename, '.js');
  const styleFileBae   = path.basename(config.buildCssFile, '.css');

  t.not(resBuild.resWebpack, undefined, 'Webpack build result not UNDEFINED');
  t.is(resBuild.resVulcanize.data, `${__dirname}/build/index.html`, 'Vulcanize data build result correct');
  t.is(resBuild.resVulcanize.message, 'Vulcanize completed.', 'Vulcanize message build result correct');
  t.is(resBuild.resMinifiedCss, 'test{font-size:10px}', 'Vulcanize build result correct');
  t.is(resBuild.resHashed.message, SUCCESS_MSG, 'hashing resources should work fine');

  t.true(await fs.pathExists(path.join(buildDir, 'index.html')), 'index.html should exist in build dir');

  const filesInBuildDir = await pify(fs.readdir)(buildDir);
  const bundleFile      = filesInBuildDir.filter(f => f.indexOf(bundleFileBase) === 0)[0];

  t.truthy(bundleFile, 'bundle should exist in build dir');

  const filesInAssetsDir = await pify(fs.readdir)(path.join(buildDir, config.assetsFolder));
  const styleFile        = filesInAssetsDir.filter(f => f.indexOf(styleFileBae) === 0)[0];

  t.truthy(styleFile, 'style.min should exist in build dir');

  const bundleContent = await pify(fs.readFile)(path.join(buildDir, bundleFile), 'utf8');
  t.false(bundleContent.includes('console.log'), 'should strip "console.log" away');
});

test('correct build() when webpack entry is an object', async t => {
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

  const webpackConfig = require('./src-test/webpack.test.config');
  webpackConfig.entry = {
    main: webpackConfig.entry,
    vendors: ['ava']
  };
  webpackConfig.output.filename = '[name].bundle.js';

  const fn       = new Fn(config, webpackConfig);
  const resBuild = await fn.build();
  const buildDir = path.resolve(config.buildFolder);

  t.not(resBuild.resWebpack, undefined, 'Webpack build result not UNDEFINED');
  t.not(resBuild.resVulcanize, undefined, 'Vulcanize build result not UNDEFINED');

  t.is(fs.existsSync(path.join(buildDir, 'index.html')), true);
  t.is(fs.existsSync(path.join(buildDir, 'main.bundle.js')), true);
  t.is(fs.existsSync(path.join(buildDir, 'vendors.bundle.js')), true);
});

test.afterEach.always(() => {
  fs.removeSync(path.join('test', 'build'));
  fs.removeSync(path.join('test', 'workspace'));
});
