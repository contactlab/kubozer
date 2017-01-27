# Kubozer

[![Build Status](https://travis-ci.org/contactlab/kubozer.svg?branch=master)](https://travis-ci.org/contactlab/kubozer) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/contactlab/kubozer)


> The best tool for Contactlab projects builds :rocket:

#### 🚧 WorkInProgress 🚧

Kubozer is a wrapper of some tools for building production (and development) application written in Polymer 1.x. and ***ESnext*** syntax.  

### Features  
- **Copy** whatever files you need into your `build` directory 
- **Replace** part of the `html` files where needed (like change the link within the index.html to your production-ready script) with [replace-in-file]()
- **Build** both `js` with [Webpack]() and `html` (Polymer) with [Vulcanize]()
- **Minify** both `js` and `css` with [node-minify]()  

Other commands are included in the bundle of Kubozer: 
- **Bump** for bump the version of your project

## Install

	$ yarn add kubozer

## Usage

```bash
  Usage
    $ [NODE_ENV=env_name] kubozer [command]

  Options
  --bump Semver label for version bump: patch, minor, major, prepatch, preminor, premajor, prerelease

  Examples
    $ kubozer --build
    $ kubozer --bump minor
```

## Enviroment typed-build 

The `PRODUCTION` build (NODE_ENV=production) will add the **minify** step to the process.  The **default** build will not produce a minified **JS** and also **CSS**.  

If you want to handle a dynamic configuration, you can simply check the `process.env.NODE_ENV` within the `kubozer.conf.js` (or also `webpack.config.js`) and change the ***exported*** configuration in relation to the NODE_ENV.

## Configuration

Kubozer will search for two configurations file: `kubozer.conf.js` and `webpack.config.js` (standard Webpack configuration file)

### Kubozer 
```javascript
// kubozer.conf.js
module.exports = {
	// Temporary workspace for build
	workspace: './workspace',
	// Where all the source app is stored
	sourceApp: './src',
	// Build folder name
	buildFolder: './build',
	// Build JS name for bundle (OPTIONAL)(default: bunlde.js)
	buildJS: 'bundle-min.js',
	// Assets for source and build
	assetsFolderName: 'assets',
	srcCSS: ['/css/test.css'],
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
			commentRegex: ['<!--styles!-->((.|\n)*)<!--styles!-->'],
			with: ['assets/style.min.css']
		},
		js: {
			files: 'index.html',
			commentRegex: ['<!--js!-->((.|\n)*)<!--js!-->'],
			with: ['bundle.js']
		}
	}
};
```

### Webpack
```javascript

const webpackConfig = {
	entry: './src/index.js',
	output: {
		// Make sure to use [name] or [id] in output.filename
		//  when using multiple entry points
		path: './build',
		filename: 'bundle.js'
	},
	devtool: 'source-map',
	module: {
		loaders: [{
			test: /\.js?$/,
			// exclude: /(node_modules|bower_components)/,
			exclude: ['node_modules', 'bundle.js', 'build'],
			loader: 'babel-loader',
			query: {
				presets: ['es2015'],
				plugins: ['transform-es2015-spread', 'syntax-object-rest-spread', 'transform-object-rest-spread']
			}
		}]
	}
};
```

## Programmatic usage
```javascript
const Kubozer = require('kubozer');
const config = {...};
const webpackConfig = {...};

// Initialize (check for required config and init workspace folder)
const k = new Kubozer(config, webpackConfig);

// Sync operation
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
```

## API

### deletePrevBuild()
Simply delete the previous build in the "workspace" directory.

### copy()
#### return `promise`
Copy every elements within the object `copy`.

### replace()
#### return `promise`
HTML replace in file. Set a placeholder in your HTML and remove/replace the inner elements during the build.

### build()
#### return `promise`
`Webpack` and `Vulcanize` following the configuration.

### minify()
#### return `promise`
Minify `JS` and `CSS` following the configuration.

### bump(type)
#### type - [patch|minor|major|prepatch|preminor|premajor|prerelease]
Bump to new version every file following the configuration.


## Development

	$ git clone https://github.com/contactlab/kubozer.git#development
	$ yarn

### Build

	$ yarn run build

### Testing
> XO as linter and AVA for units.

	$ yarn test


### Git branching policies
Any feature/bug fixing/refactor must be developed on a **feature branch** derived from the **develop** branch and integrate the changes through a **pull request** to have a code review.

### License
Released under the [Apache 2.0](https://github.com/contactlab/kubozer/blob/master/LICENSE) license.
