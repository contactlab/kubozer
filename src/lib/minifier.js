'use strict';

import path from 'path';
import fs from 'fs-extra';
import compressor from 'node-minify';

export default class Minifier {
	constructor(config) {
		this.config = config;
	}

	minifyCSS() {
		const srcPath = path.join(
			path.resolve(this.config.workspace),
			this.config.assetsFolder
		);
		const buildPath = path.join(
			path.resolve(this.config.buildFolder),
			this.config.assetsFolder
		);

		const buildCSS = this.config.buildCssFile || 'style.min.css';
		const buildFileOutput = path.join(buildPath, buildCSS);

		fs.ensureFileSync(buildFileOutput);

		const promise = compressor.minify({
			compressor: 'yui-css',
			publicFolder: srcPath,
			input: this.config.sourceCssFiles,
			output: buildFileOutput
		});

		return promise.then(res => res);
	}
}
