#! /usr/bin/env node

import path from 'path';
import meow from 'meow';
import hasFlag from 'has-flag';

import Logger from './lib/logger';
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

// Start spinner
const log = new Logger();
const msgs = [
	'COPY: Files copied correctly.',
	'REPLACE: HTML content replaced correctly.',
	'BUILD: Build JS and HTML completed correctly.',
	'MINIFY: Minify JS and CSS completed correctly.'
];

let currentStep = 0;

const buildStaging = () => {
	k.deletePrevBuild();
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
	log.set('Started PRODUCTION build', 'red');

	k.deletePrevBuild();

	log.set('Copying...');
	k.copy()
		.then(() => {
			currentStep += 1;
			log.success(msgs[currentStep]);
			log.set('Replacing...');
			return k.replace();
		})
		.then(() => {
			currentStep += 1;
			log.success(msgs[currentStep]);
			log.set('Building...');
			return k.build();
		})
		.then(() => {
			currentStep += 1;
			log.success(msgs[currentStep]);
			log.set('Minifying...');
			return k.minify();
		})
		.then(() => {
			currentStep += 1;
			log.success(msgs[currentStep]);
			log.success('Everything works with charme 🚀');
			k.deleteWorkspace();
		})
		.catch(err => {
			log.fail(msgs[currentStep]);
			console.error('ERROR:', err.message);
			return k.deleteWorkspace();
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

setTimeout(() => {
	main();
}, 2000);
