// kubozer.conf.js
module.exports = {
	workspace: './test/workspace',
	sourceFolder: './test/src-test',
	buildFolder: './test/build',
	// sourceJsFiles: ['bundle.js'],
	// buildJsFile: 'bundle.min.js'
	assetsFolder: 'assets',
	sourceCssFiles: ['/test.css'],
	buildCssFile: 'style.min.css',
	manifest: true,
	stripConsole: true,
	bump: {
		files: [
			'./test/src-test/package.json',
			'./test/src-test/manifest.json'
		]
	},
	copy: [
		{
			baseFolder: 'assets',
			items: [
				'imgs-others'
			]
		}, {
			baseFolder: 'bundles',
			items: [
				''
			]
		}
	],
	replace: {
		css: {
			files: 'index.html',
			commentRegex: ['<!--styles!--->((.|\n)*)<!--styles!--->'],
			with: ['assets/style.min.css']
		},
		js: {
			files: 'index.html',
			commentRegex: ['<!--js!--->((.|\n)*)<!--js!--->'],
			with: ['bundle.js']
		}
	},
	vulcanize: {
		srcTarget: 'index.html',
		buildTarget: 'index.html',
		conf: {
			stripComments: true,
			inlineScripts: true,
			inlineStyles: true,
			excludes: ['bundle.js']
		}
	}
};
