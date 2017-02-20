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

var config = require(_path2.default.resolve('kubozer.conf'));
var webpackConfig = require(_path2.default.resolve('webpack.config'));

var NODE_ENV = process.env.NODE_ENV;

var isProduction = function isProduction() {
	return NODE_ENV === 'production';
};

var cli = (0, _meow2.default)('\n\tUsage\n\t\t$ [NODE_ENV=env_name] kubozer [command]\n\n\tOptions\n\t\t--bump Semver label for version bump: patch, minor, major, prepatch, preminor, premajor, prerelease\n\n\tExamples\n\t\t$ NODE_ENV=production kubozer --build\n\t\t$ kubozer --bump minor\n\n');

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

		if (_path2.default.resolve(config.buildFolder) !== _path2.default.resolve(webpackConfig.output.path)) {
			log.warn('⚠️ WARNING: the "buildFolder" and the "webpackConfig.output.path" are not the same.');
		}

		spinner.set('>> Building...');
		return k.build(isProd);
	}).then(function () {
		currentStep += 1;

		if (isProd) {
			spinner.success(msgs[currentStep]);
		}

		return new Promise(function (resolve) {
			return resolve(true);
		});
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
		spinner.success(res.message);
	}).catch(function (err) {
		spinner.fail('Bumped version.');
		log.fail('\u26A0\uFE0F ERROR: ' + err.message);
	});
};

var main = function main() {
	try {
		var k = new _index2.default(config, webpackConfig);
		spinner.clear();

		if ((0, _hasFlag2.default)('build')) {
			return build(k, isProduction());
		}

		if ((0, _hasFlag2.default)('bump')) {
			return bump(k, cli.flags.bump);
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