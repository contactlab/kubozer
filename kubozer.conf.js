
module.exports = {
	// Temporary workspace for build
	workspace: './test/workspace',
	// Where all the source app is stored
	sourceApp: './test/src-test',
	// Build folder name
	buildFolder: './test/build',
	// Build JS name for bundle (OPTIONAL)(default: bunlde.js)
	buildJS: 'bundle.js',
	// Assets for source and build
	assetsFolderName: 'assets',
	srcCSS: ['/test.css'],
	buildCSS: 'style.min.css',
	// Copy or not the manifest
	manifest: true,
	// Package files where search for bump version
	packageFiles: [
		'package.json',
		'bower.json',
		'app/manifest.json'
	],
	// Copy object
	copy: [
		{
			base: 'assets',
			items: [
				'imgs-others'
			]
		}, {
			base: 'bundles',
			items: [
				''
			]
		}
	],
	// Vulcanize object
	vulcanize: {
		srcTarget: 'index.html',
		buildTarget: 'index.html',
		conf: {
			stripComments: true,
			inlineScripts: true,
			inlineStyles: true,
			excludes: ['bundle.js']
		}
	},
	// Replace object
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
	}
};
