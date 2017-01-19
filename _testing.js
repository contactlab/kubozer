const Kubozer = require('./dist/index');

const config = {
	// Temporary workspace for build
	workspace: './internalTest/workspace',
	// Where all the source app is stored
	sourceApp: './internalTest/src-test',
	// Build folder name
	buildFolder: './internalTest/build',
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
			commentRegex: '<!--styles!--->((.|\n)*)<!--styles!--->',
			with: 'assets/style.min.css'
		},
		js: {
			files: 'index.html',
			commentRegex: '<!--js!--->((.|\n)*)<!--js!--->',
			with: 'bundle.js'
		}
	}
};

const webpackConfig = {
	entry: './internalTest/src-test/app/index.js',
	output: {
		// Make sure to use [name] or [id] in output.filename
		//  when using multiple entry points
		path: './internalTest/build',
		filename: 'bundle.js'
	},
	devtool: 'source-map',
	module: {
		loaders: [{
			test: /\.js?$/,
			// exclude: /(node_modules|bower_components)/,
			exclude: ['node_modules', 'internalTest/bundle.js', 'internalTest/build'],
			loader: 'babel-loader', // 'babel-loader' is also a legal name to reference
			query: {
				presets: ['es2015'],
				plugins: ['transform-es2015-spread', 'syntax-object-rest-spread', 'transform-object-rest-spread']
			}
		}]
	}
};

const k = new Kubozer(config, webpackConfig);

k.deletePrevBuild();

k.copy()
	.then(() => k.replace())
	.then(() => k.build())
	.then(() => k.minify())
	.then(res => {
		console.log(res);
	})
	.catch(err => {
		console.error(err);
	});
