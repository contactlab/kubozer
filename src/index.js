'use strict';

import path from 'path';
import fs from 'fs-extra';
import semver from 'semver';
import replaceInFile from 'replace-in-file';

import Builder from './lib/builder';
import Minifier from './lib/minifier';

class Kubozer {
	constructor(config, webpackConfig) {
		if (!config || !webpackConfig) {
			throw new Error('Missing configurations.');
		}

		this.config = config;
		this.webpackConfig = webpackConfig;
		this._checkForRequired();

		this.Builder = new Builder(this.config, this.webpackConfig, this._res);
		this.Minifier = new Minifier(this.config);
		this.OneSky = new OneSky(this.config);

		// Ensure no previous workspaces are present
		this.deleteWorkspace();
	}

	deleteWorkspace() {
		try {
			fs.removeSync(path.resolve(this.config.workspace));
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
		this._ensureWorkspace();

		return new Promise((resolve, reject) => {
			if (this.config.manifest) {
				this._copyManifest();
			}

			if (this.config.copy) {
				this.config.copy.forEach(type => {
					type.items.forEach(item => {
						try {
							const itemPath = path.join(
								path.resolve(this.config.workspace),
								type.baseFolder,
								item
							);
							const destination = path.join(
								path.resolve(this.config.buildFolder),
								type.baseFolder,
								item
							);

							fs.copySync(itemPath, destination);
							return resolve(this._res(undefined, {itemPath, destination}, 'Copy completed.'));
						} catch (err) {
							return reject(err);
						}
					});
				});
			}

			// If "copy" is empty
			reject(this._res(true, undefined, 'copy() method was called but "copy" property is empty or undefined.'));
		});
	}

	replace() {
		this._ensureWorkspace();

		const optionCSS = {};
		const optionJS = {};

		if (this.config.replace && this.config.replace.css) {
			const cssFiles = this.config.replace.css.files;
			optionCSS.files = path.join(
				path.resolve(this.config.workspace),
				cssFiles
			);
			optionCSS.replace = this.config.replace.css.commentRegex.map(item => {
				return new RegExp(item, 'g');
			});
			optionCSS.with = this.config.replace.css.with.map(item => {
				return `
				<link rel="stylesheet" href="${item}" />
				`;
			});
		}

		if (this.config.replace && this.config.replace.js) {
			optionJS.files = path.join(
				path.resolve(this.config.workspace),
				this.config.replace.js.files
			);
			optionJS.replace = this.config.replace.js.commentRegex.map(item => {
				return new RegExp(item, 'g');
			});
			optionJS.with = this.config.replace.js.with.map(item => {
				return `
				<script src="${item}"></script>
				`;
			});
		}

		if (optionJS.files === undefined && optionCSS.files === undefined) {
			throw new Error('WARNING REPLACE(): replace method called but "files" not found in configuration');
		}

		return new Promise((resolve, reject) => {
			try {
				const changedCSS = replaceInFile.sync(optionCSS);
				const changedJS = replaceInFile.sync(optionJS);
				return resolve(this._res(undefined, {changedCSS, changedJS}, 'Replace-in-file completed.'));
			}	catch (err) {
				reject(this._res(true, undefined, err));
			}
		});
	}

	build(minify) {
		this._ensureWorkspace();

		let resWebpack;
		let resVulcanize;

		return this.Builder.webpack(minify)
			.then(res => {
				resWebpack = res;

				let promises = [this.Builder.vulcanize()];
				if (minify) {
					promises = promises.concat(this.Minifier.minifyCSS());
				}

				return Promise.all(promises);
			})
			.then(res => {
				resVulcanize = res[0];
				const dataReturn = {
					resWebpack,
					resVulcanize
				};
				// Present only with `minify` true or just undefined
				const resMinifiedCss = res[1];
				if (resMinifiedCss) {
					dataReturn.resMinifiedCss = resMinifiedCss;
				}

				return dataReturn;
			})
			.catch(err => {
				throw err;
			});
	}

	bump(type) {
		return new Promise((resolve, reject) => {
			const types = ['patch', 'minor', 'major', 'prepatch', 'preminor', 'premajor', 'prerelease'];
			const notAType = types.indexOf(type) === -1;
			if (type === null || type === undefined || typeof type !== 'string' || notAType) {
				return reject(this._res(true, undefined, `BUMP(): type must be specified. This is not a valid type --> '${type}'`));
			}

			let oldVersion = '';
			let newVersion = '';
			const dataFiles = this.config.bump.files.reduce((acc, filePath) => {
				const fullFilePath = path.resolve(filePath);
				const data = JSON.parse(fs.readFileSync(fullFilePath, 'utf8'));
				const old = data.version;
				data.version = semver.inc(data.version, type);
				oldVersion = old;
				newVersion = data.version;

				const dataString = JSON.stringify(data, null, '\t');
				fs.writeFileSync(fullFilePath, dataString);
				return acc.concat(data);
			}, []);

			return resolve(this._res(undefined, dataFiles, `Bump from ${oldVersion} to ${newVersion} completed.`));
		});
	}

	upload(language) {
		return this.OneSky.upload(language);
	}

	download(languages) {
		return this.OneSky.download(languages);
	}

	_createWorkspace() {
		try {
			const pathWorkspace = path.resolve(this.config.workspace);
			fs.ensureDirSync(pathWorkspace);
			fs.copySync(path.resolve(this.config.sourceFolder), pathWorkspace);
		} catch (err) {
			throw new Error(err);
		}
	}

	_ensureWorkspace() {
		if (fs.existsSync(path.resolve(this.config.workspace))) {
			return true;
		}

		this._createWorkspace();
	}

	_copyManifest() {
		this._ensureWorkspace();

		try {
			const pathManifest = path.resolve(path.join(this.config.workspace, 'manifest.json'));
			const pathManifestDist = path.resolve(path.join(this.config.buildFolder, 'manifest.json'));
			const exist = fs.existsSync(pathManifest);
			if (exist) {
				fs.copySync(pathManifest, pathManifestDist);
				return true;
			}

			return false;
		} catch (err) {
			throw new Error(err);
		}
	}

	_pathErrHandler(entity) {
		const err = new Error();
		const msg = 'Path must be a string. Received undefined';
		err.message = `${msg} --> ${entity}`;
		return err;
	}

	_res(err, data, message) {
		const stringified = JSON.stringify({err, data, message});
		return Object.assign({}, JSON.parse(stringified));
	}

	_checkForRequired() {
		if (!this.config.workspace || this.config.workspace === '') {
			throw this._pathErrHandler('config.workspace');
		}

		if (!this.config.sourceFolder || this.config.sourceFolder === '') {
			throw this._pathErrHandler('config.sourceFolder');
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
