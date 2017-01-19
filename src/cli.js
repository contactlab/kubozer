#! /usr/bin/env node

import path from 'path';
import meow from 'meow';
import hasFlag from 'has-flag';

import Kubozer from './index';

const config = require(path.resolve('kubozer.conf'));
const webpackConfig = require(path.resolve('webpack.config'));

const NODE_ENV = process.env.NODE_ENV;

const isProduction = () => {
	return NODE_ENV === 'production';
};

const isStaging = () => {
	return NODE_ENV === 'staging';
};

const k = new Kubozer(config, webpackConfig);

const cli = meow(`
	Usage
		$ NODE_ENV=env_name kubozer --build
		$ NODE_ENV=env_name kubozer --bump semverlabel

	Options
		--bump Semver label for version bump: patch, minor, major, prepatch, preminor, premajor, prerelease

	Examples
		$ NODE_ENV=staging kubozer --build
		$ NODE_ENV=staging kubozer --bump minor

`);

const buildStaging = () => {
	k.deletePrevBuild(() => {});
	k.copy().then(() => k.build());
};

const buildProduction = () => {
	k.deletePrevBuild(() => {});
	k.copy()
		.then(() => k.build())
		.then(() => k.minify());
};

const main = () => {
	if (isStaging() && hasFlag('build')) {
		buildStaging();
	}

	if (isProduction() && hasFlag('build')) {
		buildProduction();
	}

	if (hasFlag('bump')) {
		k.bump(cli.flags.bump);
	}
};

main();
