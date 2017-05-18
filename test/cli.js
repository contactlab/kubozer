/* eslint "key-spacing": ["error", {"align": "colon"}] */

import path    from 'path';
import fs      from 'fs-extra';
import test    from 'ava';
import execa   from 'execa';
import figures from 'figures';

import tmpDir                     from './helpers/tmp-dir';
import hconf                      from './helpers/config';
import {red, severe, warn, green} from './helpers/messages';
import kubozerConf                from './helpers/kubozer-conf';
import merge                      from './helpers/merge';

const CLI = path.join(__dirname, '../dist/cli.js');
const DIR = 'src';

const intoParent = (dir, file) => fs.move(path.join(dir, DIR, file), path.join(dir, file), {overwrite: true});

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

  const actual   = await execa.stderr(CLI, ['--bump', 'major'], {cwd: tmpDir});
  const expected = (red(figures.cross) + ' Bumped version.')
                    .concat(severe(`\n⚠️ ERROR: ENOENT: no such file or directory, open '${extra}'`));

  t.is(actual, expected);
});

test('throws param is not passed to BUMP', async t => {
  const {tmpDir} = t.context;

  await intoParent(tmpDir, 'kubozer.conf.js');

  const actual   = await execa.stderr(CLI, ['--bump'], {cwd: tmpDir});
  const expected = (red(figures.cross) + ' Bumped version.')
                    .concat(severe(`\n⚠️ ERROR: BUMP(): type must be specified. This is not a valid type --> 'true'`));

  t.is(actual, expected);
});

test('throws on constructor initialization', async t => {
  const {tmpDir} = t.context;
  const config   = {
    workspace  : path.join(tmpDir, 'workspace'),
    buildFolder: path.join(tmpDir, 'build')
  };

  await kubozerConf(tmpDir, config);

  const actual   = await execa.stderr(CLI, ['--bump'], {cwd: tmpDir});
  const expected = severe(`\n⚠️ ERROR: Path must be a string. Received undefined --> config.sourceFolder`);

  t.is(actual, expected);
});

test('throw if `copy` object is not present', async t => {
  const {tmpDir} = t.context;
  const config   = hconf(tmpDir, ['FOLDERS', 'CSS', 'MANIFEST', 'BUMP', 'VULCANIZE_NO_BUNDLE_STD']);

  await kubozerConf(tmpDir, config);

  const actual   = await execa.stderr(CLI, ['--build'], {cwd: tmpDir, env: {NODE_ENV: 'production'}});
  const expected = (red(figures.cross) + ' COPY: Files copied correctly.')
                  // eslint-disable-next-line no-useless-escape
                  .concat(severe('\n⚠️ ERROR: copy() method was called but \"copy\" property is empty or undefined.'));

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
  const actual   = await execa.stderr(CLI, ['--build'], {cwd: tmpDir});
  const expected = (red(figures.cross) + ' COPY: Files copied correctly.')
                    .concat(severe(`\n⚠️ ERROR: ENOENT: no such file or directory, stat '${img}'`));

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

  const actual   = await execa.stdout(CLI, ['--build'], {cwd: tmpDir});
  const expected = ('\n> Started STAGING build')
                    .concat(warn('\n⚠️ WARNING: the "buildFolder" and the "webpackConfig.output.path" are not the same.'));

  t.is(actual, expected);
});

test('do STAGING build without NODE_ENV declared', async t => {
  const {tmpDir} = t.context;

  await intoParent(tmpDir, 'kubozer.conf.js');

  const actual = await execa.stdout(CLI, ['--build'], {cwd: tmpDir});

  t.is(actual, '\n> Started STAGING build');
});

test('do PRODUCTION build with NODE_ENV declared', async t => {
  const {tmpDir} = t.context;

  await intoParent(tmpDir, 'kubozer.conf.js');

  const actual = await execa.stdout(CLI, ['--build'], {cwd: tmpDir, env: {NODE_ENV: 'production'}});

  t.is(actual, '\n> Started PRODUCTION build');
});

test('do build and remove workspace correctly', async t => {
  const {tmpDir} = t.context;

  await intoParent(tmpDir, 'kubozer.conf.js');

  await execa(CLI, ['--build'], {cwd: tmpDir});

  t.false(await fs.pathExists(path.join(tmpDir, 'workspace')));
});

test('do BUMP', async t => {
  const {tmpDir} = t.context;

  await intoParent(tmpDir, 'kubozer.conf.js');

  const actual   = await execa.stderr(CLI, ['--bump', 'major'], {cwd: tmpDir});
  const expected = `${green(figures.tick)} Bump from 2.0.0 to 3.0.0 completed.`;

  t.is(actual, expected);
});

test('show help command when arg is not passed', async t => {
  const {tmpDir} = t.context;

  await intoParent(tmpDir, 'kubozer.conf.js');

  const actual   = await execa.stdout(CLI, {cwd: tmpDir});
  const expected = ('\n  Contactlab build utility\n')
    .concat('\n  Usage\n    $ [NODE_ENV=env_name] kubozer [command]\n')
    .concat('\n  Options\n  ')
    .concat('  --build    Run the build task\n  ')
    .concat('  --bump     Semver label for version bump: patch, minor, major, prepatch, preminor, premajor, prerelease\n  ')
    .concat('  --i18n     Use I18N capabilities\n  ')
    .concat('  --upload   Use ONLY with --i18n option: upload a translation file\n  ')
    .concat('  --download Use ONLY with --i18n option: download a translation file\n')
    .concat('\n  Examples\n    $ NODE_ENV=production kubozer --build\n    $ kubozer --bump minor\n  ')
    .concat('  $ kubozer --i18n --upload en\n  ')
    .concat('  $ kubozer --i18n --download it');

  t.is(actual, expected);
});

test.afterEach.always(async t => {
  await fs.remove(t.context.tmpDir);
});
