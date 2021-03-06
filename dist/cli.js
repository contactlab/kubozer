#! /usr/bin/env node
'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _meow = require('meow');

var _meow2 = _interopRequireDefault(_meow);

var _hasFlag = require('has-flag');

var _hasFlag2 = _interopRequireDefault(_hasFlag);

var _spinner = require('./lib/spinner');

var _spinner2 = _interopRequireDefault(_spinner);

var _logger = require('./lib/logger');

var _logger2 = _interopRequireDefault(_logger);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isProduction = function isProduction() {
  return process.env.NODE_ENV === 'production';
};

var cli = (0, _meow2.default)('\n  Usage\n    $ [NODE_ENV=env_name] kubozer [command]\n\n  Options\n    --build          Run the build task\n    --bump           Semver label for version bump: patch, minor, major, prepatch, preminor, premajor, prerelease\n    --config         Load specified Kubozer configuration file\n    --webpack-config Load specified Webpack configuration file\n    --i18n           Use I18N capabilities\n    --upload         Use ONLY with --i18n option: upload a translation file\n    --download       Use ONLY with --i18n option: download a translation file\n\n  Examples\n    $ NODE_ENV=production kubozer --build\n    $ kubozer --build --config=../../kubozer.conf.js --webpack-config=another-webpack.config.js\n    $ kubozer --bump minor\n    $ kubozer --i18n --upload en\n    $ kubozer --i18n --download it\n');

var log = new _logger2.default();
// Start spinner
var spinner = new _spinner2.default('Preparing rockets and fuel to start Kubozer...');
var msgs = ['COPY: Files copied correctly.', 'REPLACE: HTML content replaced correctly.', 'BUILD: Build JS and HTML completed correctly.', 'MINIFY: Minify JS and CSS completed correctly.'];

var currentStep = 0;

var build = function build(k, isProd) {
  if (isProd) {
    log.set('\n> Started PRODUCTION build', 'cyan');
  } else {
    log.set('\n> Started STAGING build', 'blue');
  }

  k.deletePrevBuild();

  spinner.set('>> Copying...');
  k.copy().then(function () {
    currentStep += 1;
    spinner.success(msgs[currentStep]);
    spinner.set('>> Replacing...');
    return k.replace();
  }).then(function () {
    currentStep += 1;
    spinner.success(msgs[currentStep]);

    if (_path2.default.resolve(k.config.buildFolder) !== _path2.default.resolve(k.webpackConfig.output.path)) {
      log.warn('⚠️ WARNING: the "buildFolder" and the "webpackConfig.output.path" are not the same.');
    }

    spinner.set('>> Building...');
    return k.build(isProd);
  }).then(function () {
    currentStep += 1;

    if (isProd) {
      spinner.success(msgs[currentStep]);
    }

    return true;
  }).then(function () {
    currentStep += 1;
    spinner.success(msgs[currentStep]);
    spinner.success('Everything works with charme 🚀');
    return k.deleteWorkspace();
  }).catch(function (err) {
    spinner.fail(msgs[currentStep]);
    log.fail('\u26A0\uFE0F ERROR: ' + err.message);
    return k.deleteWorkspace();
  });
};

var bump = function bump(k, type) {
  log.set('\n> Bumping version', 'yellow');

  k.bump(type).then(function (res) {
    return spinner.success(res.message);
  }).catch(function (err) {
    spinner.fail('Bumped version.');
    log.fail('\u26A0\uFE0F ERROR: ' + err.message);
  });
};

var upload = function upload(k, language) {
  /* istanbul ignore next */
  spinner.set('>> Uploading translations for ' + language + '...');
  /* istanbul ignore next */
  k.upload(language).then(function () {
    return spinner.success('Translations uploaded succesfully for ' + language);
  }).catch(function (err) {
    return spinner.fail('Something went wrong uploading your translation file for ' + language + ': ' + err.message);
  });
};

var download = function download(k, language) {
  /* istanbul ignore next */
  spinner.set('>> Downloading translations for ' + language + '...');
  /* istanbul ignore next */
  k.download(language).then(function () {
    return spinner.success('Translations downloaded succesfully for ' + language);
  }).catch(function (err) {
    return spinner.fail('Something went wrong downloading your translation file for ' + language + ': ' + err.message);
  });
};

var main = function main() {
  try {
    var config = require(_path2.default.resolve(cli.flags.config || 'kubozer.conf'));
    var webpackConfig = require(_path2.default.resolve(cli.flags.webpackConfig || 'webpack.config'));

    var k = new _index2.default(config, webpackConfig);

    /* istanbul ignore next */
    spinner.clear();

    if ((0, _hasFlag2.default)('build')) {
      return build(k, isProduction());
    }

    if ((0, _hasFlag2.default)('bump')) {
      return bump(k, cli.flags.bump);
    }

    /* istanbul ignore if */
    if ((0, _hasFlag2.default)('i18n') && (0, _hasFlag2.default)('upload')) {
      return upload(k, cli.flags.upload);
    }

    /* istanbul ignore if */
    if ((0, _hasFlag2.default)('i18n') && (0, _hasFlag2.default)('download')) {
      return download(k, cli.flags.download);
    }

    spinner.clear();
    cli.showHelp();
  } catch (err) {
    spinner.clear();
    log.fail('\n\u26A0\uFE0F ERROR: ' + err.message);
    process.exit();
  }
};

// Just to start the spinner
setTimeout(function () {
  main();
}, 1000);