'use strict';

import path from 'path';
import fs from 'fs-extra';
import semver from 'semver';
import replaceInFile from 'replace-in-file';

import Builder from './builder';
import Minifier from './minifier';

class Kubozer {
	constructor(config, webpackConfig) {
		if (!config || !webpackConfig) {
			throw new Error('Missing configurations.');
		}

		this.config = config;
		this.webpackConfig = webpackConfig;
		this._checkForRequired();

		this.Builder = new Builder(this.config, this.webpackConfig);
		this.Minifier = new Minifier(this.config);

		// Ensure no previous workspaces are present
		this._deleteWorkspace();
		this._createWorkspace();
	}

	_deleteWorkspace() {
		try {
			fs.removeSync(path.resolve(this.config.workspace));
		} catch (err) {
			throw new Error(err);
		}
	}

	_createWorkspace() {
		try {
			const pathWorkspace = path.resolve(this.config.workspace);
			fs.ensureDirSync(pathWorkspace);
			fs.copySync(path.resolve(this.config.sourceApp), pathWorkspace);
		} catch (err) {
			throw new Error(err);
		}
	}

	_copyManifest() {
		try {
			const pathManifest = path.resolve(path.join(this.config.workspace, 'manifest.json'));
			const pathManifestDist = path.resolve(path.join(this.config.buildFolder, 'manifest.json'));
			const exist = fs.existsSync(pathManifest);
			if (exist) {
				fs.copySync(pathManifest, pathManifestDist);
				return true;
			}
			console.warn('WARNING: manifest.json not found. --->', pathManifest);
			return false;
		} catch (err) {
			throw new Error(err);
		}
	}

	deletePrevBuild() {
		try {
			const pathToBuild = path.resolve(this.config.buildFolder);
			fs.removeSync(path.resolve(pathToBuild));
		} catch (err) {
			throw new Error(err);
		}
	}

	/**
	 * {string} type: 'assets' || 'bundles'
	 *
	 */
	copy() {
		return new Promise((resolve, reject) => {
			if (this.config.manifest) {
				this._copyManifest();
			}

			this.config.copy.forEach(type => {
				type.items.forEach(item => {
					const itemPath = path.join(
						path.resolve(this.config.workspace),
						type.base,
						item
					);
					const destination = path.join(
						path.resolve(this.config.buildFolder),
						type.base,
						item
					);

					try {
						fs.copySync(itemPath, destination);
						console.info(`Copied ${itemPath} to ${destination}`);
						resolve(this);
					} catch (err) {
						reject(err);
					}
				});
			});

			// If "copy" is empty
			const err = new Error();
			err.message = 'copy() method was called but "copy" property is empty.';
			reject(err);
		});
	}

	replace() {
		const optionCSS = {};
		const optionJS = {};

		if (this.config.replace && this.config.replace.css) {
			const cssFiles = this.config.replace.css.files;
			optionCSS.files = path.join(
				path.resolve(this.config.workspace),
				cssFiles
			);
			optionCSS.replace = new RegExp(this.config.replace.css.commentRegex, 'g');
			optionCSS.with = `
			<link rel="stylesheet" href="${this.config.replace.css.with}" />
			`;
		}

		if (this.config.replace && this.config.replace.js) {
			optionJS.files = path.join(
				path.resolve(this.config.workspace),
				this.config.replace.js.files
			);
			optionJS.replace = new RegExp(this.config.replace.js.commentRegex, 'g');
			optionJS.with = `
			<script src="${this.config.replace.js.with}"></script>
			`;
		}

		if (optionJS.files === undefined && optionCSS.files === undefined) {
			throw new Error('WARNING REPLACE(): replace method called but "files" not found in configuration');
		}

		// NOTE: can't use Promise.all 'cause we are modifying the same file
		// First check for CSS option and then for JS option
		return replaceInFile(optionCSS.files ? optionCSS : optionJS)
			.then(() => {
				if (optionCSS.files) {
					return replaceInFile(optionJS);
				}
				// Return a simple promise if we have only one option
				return new Promise(resolve => resolve(true));
			})
			.then(() => {
				return true;
			})
			.catch(err => {
				throw new Error(err);
			});
	}

	build() {
		let resWebpack;
		let resVulcanize;

		return this.Builder.webpack()
			.then(res => {
				resWebpack = res;
				console.log('Builded WEBPACK');
				return this.Builder.vulcanize();
			})
			.then(res => {
				console.log('loooooog', res);
				resVulcanize = res;
				return {
					resWebpack,
					resVulcanize
				};
			})
			.catch(err => {
				console.log('loggo', err);
				throw new Error(err);
			});
	}

	minify() {
		const pJS = this.Minifier.minifyJS();
		const pCSS = this.Minifier.minifyCSS();
		return Promise.all([pJS, pCSS])
			.then(res => {
				return res;
			});
	}

	bump(type) {
		return new Promise((resolve, reject) => {
			if (type === null || type === undefined) {
				return reject(new Error('BUMP(): type must be specified.'));
			}

			const dataFiles = this.config.packageFiles.reduce((acc, filePath) => {
				const fullFilePath = path.resolve(filePath);
				const data = JSON.parse(fs.readFileSync(fullFilePath, 'utf8'));
				const oldVersion = data.version;
				data.version = semver.inc(data.version, type);

				const dataString = JSON.stringify(data, null, '\t');
				fs.writeFileSync(fullFilePath, dataString);
				console.info(`Successfully updated ${fullFilePath} version from ${oldVersion} to ${data.version}`);
				return acc.concat(data);
			}, []);

			return resolve(dataFiles);
		});
	}

	_pathErrHandler(entity) {
		const err = new Error();
		const msg = 'Path must be a string. Received undefined';
		err.message = `${msg} --> ${entity}`;
		return err;
	}

	_checkForRequired() {
		if (!this.config.workspace || this.config.workspace === '') {
			throw this._pathErrHandler('config.workspace');
		}

		if (!this.config.sourceApp || this.config.sourceApp === '') {
			throw this._pathErrHandler('config.sourceApp');
		}

		if (!this.config.buildFolder || this.config.buildFolder === '') {
			throw this._pathErrHandler('config.buildFolder');
		}

		if (!this.config.buildJS || this.config.buildJS === '') {
			this.config.buildJS = 'bundle.js';
		}

		if (!this.config.copy) {
			this.config.copy = [];
		}
	}
}

export default Kubozer;
