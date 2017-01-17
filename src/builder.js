'use strict';

import path from 'path';

import fs from 'fs-extra';
import webpack from 'webpack';
import Vulcanize from 'vulcanize';

export default class Builder {
	constructor(config, webpackConfig) {
		this.config = config;
		this.webpackConfig = webpackConfig;
	}

	webpack() {
		return new Promise((resolve, reject) => {
			if (fs.existsSync(this.webpackConfig.entry) === false) {
				reject('WEBPACK: Entry file not found.');
			}

			fs.ensureDirSync(this.config.buildFolder);
			fs.ensureFileSync(path.resolve(this.config.buildFolder, this.config.buildJS));

			this.webpackConfig.output.path = this.config.buildFolder;
			this.webpackConfig.output.filename = this.config.buildJS;

			const compiler = webpack(this.webpackConfig);
			compiler.run((err, stats) => {
				if (err) {
					reject(err);
					return;
				}
				console.info('Webpack compilation completed');
				resolve(stats);
			});
		});
	}

	vulcanize() {
		return new Promise((resolve, reject) => {
			console.log('REJECY', this.config.vulcanize);
			if (this.config.vulcanize === undefined) {
				reject(`Vulcanize configuration is not present. ---> config.vulcanize === undefined`);
			}

			const vulcan = new Vulcanize(this.config.vulcanize.conf);

			const workspaceIndex = path.join(
				path.resolve(this.config.workspace),
				this.config.vulcanize.srcTarget
			);
			const buildIndex = path.join(
				path.resolve(this.config.buildFolder),
				this.config.vulcanize.buildTarget
			);

			console.log('PATHS', workspaceIndex, buildIndex);

			vulcan.process(workspaceIndex, (err, inlinedHTML) => {
				if (err) {
					const msg = `${err.message} | Did you checked the "excludes" property of "vulcanize" configuration?`;
					reject(err.message.search('no such file') > -1 ? msg : err.message);
				}
				fs.ensureFileSync(buildIndex);
				fs.writeFile(buildIndex, inlinedHTML, err => {
					if (err) {
						reject(err);
					}
					resolve(buildIndex);
				});
			});
		});
	}
}
