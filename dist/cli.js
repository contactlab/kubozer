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

var isStaging = function isStaging() {
	return NODE_ENV === 'staging';
};

var k = new _index2.default(config, webpackConfig);

var cli = (0, _meow2.default)('\n\tUsage\n\t\t$ NODE_ENV=env_name kubozer --build\n\t\t$ NODE_ENV=env_name kubozer --bump semverlabel\n\n\tOptions\n\t\t--bump Semver label for version bump: patch, minor, major, prepatch, preminor, premajor, prerelease\n\n\tExamples\n\t\t$ NODE_ENV=staging kubozer --build\n\t\t$ NODE_ENV=staging kubozer --bump minor\n\n');

var buildStaging = function buildStaging() {
	k.deletePrevBuild(function () {});
	k.copy().then(function () {
		return k.build();
	});
};

var buildProduction = function buildProduction() {
	k.deletePrevBuild(function () {});
	k.copy().then(function () {
		return k.build();
	}).then(function () {
		return k.minify();
	});
};

var main = function main() {
	if (isStaging() && (0, _hasFlag2.default)('build')) {
		buildStaging();
	}

	if (isProduction() && (0, _hasFlag2.default)('build')) {
		buildProduction();
	}

	if ((0, _hasFlag2.default)('bump')) {
		k.bump(cli.flags.bump);
	}
};

main();