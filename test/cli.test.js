/* eslint "key-spacing": ["error", {"align": "colon"}] */

import path    from 'path';
import fs      from 'fs-extra';
import test    from 'ava';
import execa   from 'execa';
import figures from 'figures';

import tmpDir      from './helpers/tmp-dir';
import hconf       from './helpers/config';
import kubozerConf from './helpers/kubozer-conf';
import merge       from './helpers/merge';

import {red, severe, warn, green, blue, cyan} from './helpers/messages';

const CLI = path.join(__dirname, '../dist/cli.js');
const DIR = 'src';

const intoParent = (dir, file) => fs.move(path.join(dir, DIR, file), path.join(dir, file), {overwrite: true});
const execaOpts = (dir, isProd = false) => ({
  cwd: dir,
  env: isProd ? {NODE_ENV: 'production', FORCE_COLOR: true} : {FORCE_COLOR: true}
});
const lines = (...args) => [...args].join('\n');

test.beforeEach(async t => {
  // eslint-disable-next-line ava/use-t-well
  const workDir = await tmpDir(path.join(__dirname, 'integration/cli'), t.title);

  await fs.move(path.join(workDir, 'cli'), path.join(workDir, DIR));
  await intoParent(workDir, 'webpack.config.js');

  t.context.tmpDir = workDir;
});

test('throws when a file is not found during BUMP', async t => {
  const {tmpDir} = t.context;

  const extra  = path.join(tmpDir, DIR, 'bower.json');
  const config = merge(hconf(tmpDir, ['FOLDERS', 'CSS', 'MANIFEST', 'VULCANIZE_NO_BUNDLE_STD']), {
    bump: {
      files: [
        path.join(tmpDir, DIR, 'package.json'),
        path.join(tmpDir, DIR, 'manifest.json'),
        extra
      ]
    }
  });

  await kubozerConf(tmpDir, config);

  const actual   = await execa.stderr(CLI, ['--bump', 'major'], execaOpts(tmpDir));
  const expected = lines(
    `${red(figures.cross)} Bumped version.`,
    severe(`⚠️ ERROR: ENOENT: no such file or directory, open '${extra}'`)
  );

  t.is(actual, expected);
});

test('throws param is not passed to BUMP', async t => {
  const {tmpDir} = t.context;

  await intoParent(tmpDir, 'kubozer.conf.js');

  const actual   = await execa.stderr(CLI, ['--bump'], execaOpts(tmpDir));
  const expected = lines(
    `${red(figures.cross)} Bumped version.`,
    severe(`⚠️ ERROR: BUMP(): type must be specified. This is not a valid type --> 'true'`)
  );

  t.is(actual, expected);
});

test('throws on constructor initialization', async t => {
  const {tmpDir} = t.context;
  const config   = {
    workspace  : path.join(tmpDir, 'workspace'),
    buildFolder: path.join(tmpDir, 'build')
  };

  await kubozerConf(tmpDir, config);

  const actual   = await execa.stderr(CLI, ['--bump'], execaOpts(tmpDir));
  const expected = severe(`\n⚠️ ERROR: Path must be a string. Received undefined --> config.sourceFolder`);

  t.is(actual, expected);
});

test('throw if `copy` object is not present', async t => {
  const {tmpDir} = t.context;
  const config   = hconf(tmpDir, ['FOLDERS', 'CSS', 'MANIFEST', 'BUMP', 'VULCANIZE_NO_BUNDLE_STD']);

  await kubozerConf(tmpDir, config);

  const actual   = await execa.stderr(CLI, ['--build'], execaOpts(tmpDir, true));
  const expected = lines(
    `${red(figures.cross)} COPY: Files copied correctly.`,
    severe('⚠️ ERROR: copy() method was called but "copy" property is empty or undefined.')
  );

  t.is(actual, expected);
});

test('throw if not found elment to `copy`', async t => {
  const {tmpDir} = t.context;
  const config   = merge(hconf(tmpDir, ['FOLDERS', 'CSS', 'MANIFEST', 'BUMP', 'VULCANIZE_NO_BUNDLE_STD', 'REPLACE']), {
    copy: [
      {
        baseFolder: 'assets',
        items     : ['imgs-asdasdasdasdasdasdasd']
      }, {
        baseFolder: 'bundles',
        items     : []
      }
    ]
  });

  await kubozerConf(tmpDir, config);

  const img      = path.join(config.workspace, config.assetsFolder, 'imgs-asdasdasdasdasdasdasd');
  const actual   = await execa.stderr(CLI, ['--build'], execaOpts(tmpDir));
  const expected = lines(
    `${red(figures.cross)} COPY: Files copied correctly.`,
    severe(`⚠️ ERROR: ENOENT: no such file or directory, stat '${img}'`)
  );

  t.is(actual, expected);
});

test('warn when webpack output.path is NOT the same of kubozer buildFolder', async t => {
  const {tmpDir} = t.context;
  const config   = merge(hconf(tmpDir, ['FOLDERS', 'CSS', 'MANIFEST', 'BUMP', 'COPY', 'VULCANIZE_NO_BUNDLE_STD']), {
    buildFolder: path.join(tmpDir, 'build/another'),
    replace    : {
      css: {
        files       : 'index.html',
        commentRegex: ['<!--styles!--->((.|)*)<!--styles!--->'],
        with        : ['assets/style.min.css']
      },
      js: {
        files       : 'index.html',
        commentRegex: ['<!--js!--->((.|)*)<!--js!--->'],
        with        : ['bundle.js']
      }
    }
  });

  await kubozerConf(tmpDir, config);

  const actual   = await execa.stdout(CLI, ['--build'], execaOpts(tmpDir));
  const expected = lines(
    blue('\n> Started STAGING build'),
    warn('⚠️ WARNING: the "buildFolder" and the "webpackConfig.output.path" are not the same.')
  );

  t.is(actual, expected);
});

test('do STAGING build without NODE_ENV declared', async t => {
  const {tmpDir} = t.context;

  await intoParent(tmpDir, 'kubozer.conf.js');

  const actual = await execa.stdout(CLI, ['--build'], execaOpts(tmpDir));

  t.is(actual, blue('\n> Started STAGING build'));
});

test('do PRODUCTION build with NODE_ENV declared', async t => {
  const {tmpDir} = t.context;

  await intoParent(tmpDir, 'kubozer.conf.js');

  const actual = await execa.stdout(CLI, ['--build'], execaOpts(tmpDir, true));

  t.is(actual, cyan('\n> Started PRODUCTION build'));
});

test('do build and remove workspace correctly', async t => {
  const {tmpDir} = t.context;

  await intoParent(tmpDir, 'kubozer.conf.js');

  await execa(CLI, ['--build'], execaOpts(tmpDir));

  t.false(await fs.pathExists(path.join(tmpDir, 'workspace')));
});

test('do BUMP', async t => {
  const {tmpDir} = t.context;

  await intoParent(tmpDir, 'kubozer.conf.js');

  const actual   = await execa.stderr(CLI, ['--bump', 'major'], execaOpts(tmpDir));
  const expected = `${green(figures.tick)} Bump from 2.0.0 to 3.0.0 completed.`;

  t.is(actual, expected);
});

test('show help command when arg is not passed', async t => {
  const {tmpDir} = t.context;

  await intoParent(tmpDir, 'kubozer.conf.js');

  const actual   = await execa.stdout(CLI, execaOpts(tmpDir));
  const expected = lines(
    '\n  Contactlab build utility',
    '\n  Usage',
    '    $ [NODE_ENV=env_name] kubozer [command]',
    '\n  Options',
    '    --build          Run the build task',
    '    --bump           Semver label for version bump: patch, minor, major, prepatch, preminor, premajor, prerelease',
    '    --config         Load specified Kubozer configuration file',
    '    --webpack-config Load specified Webpack configuration file',
    '    --i18n           Use I18N capabilities',
    '    --upload         Use ONLY with --i18n option: upload a translation file',
    '    --download       Use ONLY with --i18n option: download a translation file',
    '\n  Examples',
    '    $ NODE_ENV=production kubozer --build',
    '    $ kubozer --build --config=../../kubozer.conf.js --webpack-config=another-webpack.config.js',
    '    $ kubozer --bump minor',
    '    $ kubozer --i18n --upload en',
    '    $ kubozer --i18n --download it'
  );

  t.is(actual, expected);
});

test('override configuration file path with --config', async t => {
  const {tmpDir} = t.context;

  await intoParent(tmpDir, 'kubozer_alt.conf.js');

  const actual   = await execa.stderr(CLI, ['--bump', 'major', '--config', 'kubozer_alt.conf.js'], execaOpts(tmpDir));
  const expected = `${green(figures.tick)} Bump from 12.0.0 to 13.0.0 completed.`;

  t.is(actual, expected);
});

test('override webpack configuration file path with --webpack-config', async t => {
  const {tmpDir} = t.context;

  await intoParent(tmpDir, 'kubozer_alt.conf.js');
  await intoParent(tmpDir, 'webpack_alt.config.js');

  await execa(
    CLI,
    ['--build', '--config=kubozer_alt.conf.js', '--webpack-config=webpack_alt.config.js'],
    execaOpts(tmpDir)
  );

  t.true(await fs.pathExists(path.join(tmpDir, 'build/bundle_alt.js')));
});

test('throws if --config or ---webpack-config files do not exist', async t => {
  const {tmpDir} = t.context;

  const actual = await execa.stderr(
    CLI,
    ['--build', '--config=kubozer_alt.conf.js', '--webpack-config=webpack_alt.config.js'],
    execaOpts(tmpDir)
  );
  const expected = severe(`\n⚠️ ERROR: Cannot find module '${path.join(tmpDir, 'kubozer_alt.conf.js')}'`);

  t.is(actual, expected);
});

test.afterEach.always(async t => {
  await fs.remove(t.context.tmpDir);
});
