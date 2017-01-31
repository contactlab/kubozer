#! /usr/bin/env node
'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _meow = require('meow');

var _meow2 = _interopRequireDefault(_meow);

var _hasFlag = require('has-flag');

var _hasFlag2 = _interopRequireDefault(_hasFlag);

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

var k = new _index2.default(config, webpackConfig);

var cli = (0, _meow2.default)('\n\tUsage\n\t\t$ [NODE_ENV=env_name] kubozer [command]\n\n\tOptions\n\t\t--bump Semver label for version bump: patch, minor, major, prepatch, preminor, premajor, prerelease\n\n\tExamples\n\t\t$ NODE_ENV=production kubozer --build\n\t\t$ kubozer --bump minor\n\n');

// Start spinner
var log = new _logger2.default();
var msgs = ['COPY: Files copied correctly.', 'REPLACE: HTML content replaced correctly.', 'BUILD: Build JS and HTML completed correctly.', 'MINIFY: Minify JS and CSS completed correctly.'];

var currentStep = 0;

var buildStaging = function buildStaging() {
	k.deletePrevBuild();
	k.copy().then(function () {
		return k.replace();
	}).then(function () {
		return k.build();
	}).then(function (res) {
		k.deleteWorkspace();
		console.log(res);
	}).catch(function (err) {
		k.deleteWorkspace();
		console.error(err);
	});
};

var buildProduction = function buildProduction() {
	log.set('Started PRODUCTION build', 'red');

	k.deletePrevBuild();

	log.set('Copying...');
	k.copy().then(function () {
		currentStep += 1;
		log.success(msgs[currentStep]);
		log.set('Replacing...');
		return k.replace();
	}).then(function () {
		currentStep += 1;
		log.success(msgs[currentStep]);
		log.set('Building...');
		return k.build();
	}).then(function () {
		currentStep += 1;
		log.success(msgs[currentStep]);
		log.set('Minifying...');
		return k.minify();
	}).then(function () {
		currentStep += 1;
		log.success(msgs[currentStep]);
		log.success('Everything works with charme 🚀');
		k.deleteWorkspace();
	}).catch(function (err) {
		log.fail(msgs[currentStep]);
		console.error('ERROR:', err.message);
		return k.deleteWorkspace();
	});
};

var main = function main() {
	if (isProduction() && (0, _hasFlag2.default)('build')) {
		return buildProduction();
	}

	if ((0, _hasFlag2.default)('build')) {
		return buildStaging();
	}

	if ((0, _hasFlag2.default)('bump')) {
		k.bump(cli.flags.bump);
	}
};

setTimeout(function () {
	main();
}, 2000);