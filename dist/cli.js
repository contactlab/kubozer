#! /usr/bin/env node
'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _meow = require('meow');

var _meow2 = _interopRequireDefault(_meow);

var _hasFlag = require('has-flag');

var _hasFlag2 = _interopRequireDefault(_hasFlag);

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

var buildStaging = function buildStaging() {
	k.deletePrevBuild(function () {});
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
	k.deletePrevBuild(function () {});
	k.copy().then(function () {
		return k.replace();
	}).then(function () {
		return k.build();
	}).then(function () {
		return k.minify();
	}).then(function (res) {
		k.deleteWorkspace();
		console.log(res);
	}).catch(function (err) {
		k.deleteWorkspace();
		console.error(err);
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

main();