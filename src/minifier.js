'use strict';

import path from 'path';
import compressor from 'node-minify';

export default class Minifier {
	constructor(config) {
		this.config = config;
	}

	minifyJS() {
		const buildPath = path.join(
			path.resolve(this.config.buildFolder),
			this.config.buildJS
		);
		const promise = compressor.minify({
			compressor: 'gcc',
			input: buildPath,
			output: buildPath
		});

		return promise.then(res => res);
	}

	minifyCSS() {
		const srcPath = path.join(
			path.resolve(this.config.workspace),
			this.config.assetsFolderName
		);
		const buildPath = path.join(
			path.resolve(this.config.buildFolder),
			this.config.assetsFolderName
		);
		const buildCSS = this.config.buildCSS || 'style.min.css';
		const promise = compressor.minify({
			compressor: 'yui-css',
			publicFolder: srcPath,
			input: this.config.srcCSS,
			output: `${buildPath}/${buildCSS}`
		});
		return promise.then(res => res);
	}
}
