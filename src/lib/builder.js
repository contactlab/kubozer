'use strict';

import path from 'path';

import fs from 'fs-extra';
import webpack from 'webpack';
import Vulcanize from 'vulcanize';

export default class Builder {
	constructor(config, webpackConfig, resFunc) {
		this.config = config;
		this.webpackConfig = webpackConfig;

		this._res = resFunc;
	}

	webpack(minify) {
		return new Promise((resolve, reject) => {
			fs.ensureDirSync(this.config.buildFolder);

			if (minify) {
				const uglify = new webpack.optimize.UglifyJsPlugin({
					compress: {
						warnings: false
					},
					sourceMap: true
				});

				this.webpackConfig.plugins = this.webpackConfig.plugins ? this.webpackConfig.plugins.concat(uglify) : [uglify];
			}

			try {
				const compiler = webpack(this.webpackConfig);
				compiler.run(err => {
					if (err) {
						return reject(this._res(true, undefined, err));
					}
					return resolve(this._res(undefined, [{completed: true}], 'Webpack compilation completed'));
				});
			} catch (err) {
				return reject(this._res(err.name, undefined, err.message));
			}
		});
	}

	vulcanize() {
		return new Promise((resolve, reject) => {
			if (this.config.vulcanize === undefined) {
				reject(this._res(true, undefined, `Vulcanize configuration is not present. ---> config.vulcanize === undefined`));
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

			vulcan.process(workspaceIndex, (err, inlinedHTML) => {
				if (err) {
					const msg = `${err.message} | Did you checked the "excludes" property of "vulcanize" configuration?`;
					return reject(this._res(true, undefined, err.message.search('no such file') > -1 ? msg : err.message));
				}
				fs.ensureFileSync(buildIndex);
				fs.writeFile(buildIndex, inlinedHTML, err => {
					if (err) {
						return reject(err);
					}
					return resolve(this._res(undefined, buildIndex, 'Vulcanize completed.'));
				});
			});
		});
	}
}
