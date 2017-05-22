#! /usr/bin/env node

import path from 'path';
import meow from 'meow';
import hasFlag from 'has-flag';

import Spinner from './lib/spinner';
import Logger from './lib/logger';
import Kubozer from './index';

const config = require(path.resolve('kubozer.conf'));
const webpackConfig = require(path.resolve('webpack.config'));

const NODE_ENV = process.env.NODE_ENV;

const isProduction = () => {
  return NODE_ENV === 'production';
};

const cli = meow(`
  Usage
    $ [NODE_ENV=env_name] kubozer [command]

  Options
    --build    Run the build task
    --bump     Semver label for version bump: patch, minor, major, prepatch, preminor, premajor, prerelease
    --i18n     Use I18N capabilities
    --upload   Use ONLY with --i18n option: upload a translation file
    --download Use ONLY with --i18n option: download a translation file

  Examples
    $ NODE_ENV=production kubozer --build
    $ kubozer --bump minor
    $ kubozer --i18n --upload en
    $ kubozer --i18n --download it

`);

const log = new Logger();
// Start spinner
const spinner = new Spinner('Preparing rockets and fuel to start Kubozer...');
const msgs = [
  'COPY: Files copied correctly.',
  'REPLACE: HTML content replaced correctly.',
  'BUILD: Build JS and HTML completed correctly.',
  'MINIFY: Minify JS and CSS completed correctly.'
];

let currentStep = 0;

const build = (k, isProd) => {
  if (isProd) {
    log.set('\n> Started PRODUCTION build', 'cyan');
  } else {
    log.set('\n> Started STAGING build', 'blue');
  }

  k.deletePrevBuild();

  spinner.set('>> Copying...');
  k.copy()
    .then(() => {
      currentStep += 1;
      spinner.success(msgs[currentStep]);
      spinner.set('>> Replacing...');
      return k.replace();
    })
    .then(() => {
      currentStep += 1;
      spinner.success(msgs[currentStep]);

      if (path.resolve(k.config.buildFolder) !== path.resolve(k.webpackConfig.output.path)) {
        log.warn('⚠️ WARNING: the "buildFolder" and the "webpackConfig.output.path" are not the same.');
      }

      spinner.set('>> Building...');
      return k.build(isProd);
    })
    .then(() => {
      currentStep += 1;

      if (isProd) {
        spinner.success(msgs[currentStep]);
      }

      return new Promise(resolve => resolve(true));
    })
    .then(() => {
      currentStep += 1;
      spinner.success(msgs[currentStep]);
      spinner.success('Everything works with charme 🚀');
      return k.deleteWorkspace();
    })
    .catch(err => {
      spinner.fail(msgs[currentStep]);
      log.fail(`⚠️ ERROR: ${err.message}`);
      return k.deleteWorkspace();
    });
};

const bump = (k, type) => {
  log.set('\n> Bumping version', 'yellow');

  k.bump(type)
    .then(res => {
      spinner.success(res.message);
    })
    .catch(err => {
      spinner.fail('Bumped version.');
      log.fail(`⚠️ ERROR: ${err.message}`);
    });
};

const upload = (k, language) => {
  /* istanbul ignore next */
  spinner.set(`>> Uploading translations for ${language}...`);
  /* istanbul ignore next */
  k.upload(language)
    .then(() => {
      spinner.success(`Translations uploaded succesfully for ${language}`);
    })
    .catch(err => {
      spinner.fail(`Something went wrong uploading your translation file for ${language}: ${err.message}`);
    });
};

const download = (k, language) => {
  /* istanbul ignore next */
  spinner.set(`>> Downloading translations for ${language}...`);
  /* istanbul ignore next */
  k.download(language)
    .then(() => {
      spinner.success(`Translations downloaded succesfully for ${language}`);
    })
    .catch(err => {
      spinner.fail(`Something went wrong downloading your translation file for ${language}: ${err.message}`);
    });
};

const main = () => {
  try {
    const k = new Kubozer(config, webpackConfig);
    /* istanbul ignore next */
    spinner.clear();

    if (hasFlag('build')) {
      return build(k, isProduction());
    }

    if (hasFlag('bump')) {
      return bump(k, cli.flags.bump);
    }

    /* istanbul ignore if */
    if (hasFlag('i18n') && hasFlag('upload')) {
      return upload(k, cli.flags.upload);
    }

    /* istanbul ignore if */
    if (hasFlag('i18n') && hasFlag('download')) {
      return download(k, cli.flags.download);
    }

    spinner.clear();
    cli.showHelp();
  } catch (err) {
    spinner.clear();
    log.fail(`\n⚠️ ERROR: ${err.message}`);
    process.exit();
  }
};

// Just to start the spinner
setTimeout(() => {
  main();
}, 1000);
