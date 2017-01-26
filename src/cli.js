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

const k = new Kubozer(config, webpackConfig);

const cli = meow(`
	Usage
		$ [NODE_ENV=env_name] kubozer [command]

	Options
		--bump Semver label for version bump: patch, minor, major, prepatch, preminor, premajor, prerelease

	Examples
		$ NODE_ENV=production kubozer --build
		$ kubozer --bump minor

`);

const buildStaging = () => {
	k.deletePrevBuild(() => {});
	k.copy()
		.then(() => k.replace())
		.then(() => k.build())
		.then(res => {
			k.deleteWorkspace();
			console.log(res);
		})
		.catch(err => {
			k.deleteWorkspace();
			console.error(err);
		});
};

const buildProduction = () => {
	k.deletePrevBuild(() => {});
	k.copy()
		.then(() => k.replace())
		.then(() => k.build())
		.then(() => k.minify())
		.then(res => {
			k.deleteWorkspace();
			console.log(res);
		})
		.catch(err => {
			k.deleteWorkspace();
			console.error(err);
		});
};

const main = () => {
	if (isProduction() && hasFlag('build')) {
		return buildProduction();
	}

	if (hasFlag('build')) {
		return buildStaging();
	}

	if (hasFlag('bump')) {
		k.bump(cli.flags.bump);
	}
};

main();
