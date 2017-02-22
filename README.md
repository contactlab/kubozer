<p align="center">
	<img src="https://raw.githubusercontent.com/contactlab/kubozer/master/Kubozer.png" alt="Kubozer"/>
</p>

---

> The best tool for Contactlab projects builds :rocket:

[![GitHub tag](https://img.shields.io/github/release/contactlab/kubozer.svg?style=flat-square)](https://github.com/contactlab/kubozer)
[![Build Status](https://travis-ci.org/contactlab/kubozer.svg?branch=master)](https://travis-ci.org/contactlab/kubozer)
[![Coverage Status](https://coveralls.io/repos/github/contactlab/kubozer/badge.svg?branch=master)](https://coveralls.io/github/contactlab/kubozer?branch=master)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/contactlab/kubozer)
[![npm](https://img.shields.io/npm/dt/kubozer.svg?style=flat-square)](https://github.com/contactlab/kubozer)
[![Package Quality](http://npm.packagequality.com/shield/kubozer.png?style=flat-square)](http://packagequality.com/#?package=kubozer)


Kubozer is a wrapper of some tools for building production (and development) application written in Polymer 1.x. and ***ESnext*** syntax.  

## Features  
- **Copy** whatever files you need into your `build` directory 
- **Replace** part of the `html` files where needed (like change the link within the index.html to your production-ready script) with [replace-in-file]()
- **Build** both `js` with [Webpack](https://github.com/webpack/webpack) and `html` (Polymer) with [Vulcanize](https://www.npmjs.com/package/vulcanize)
- **Minify** minify `CSS` with [node-minify](https://www.npmjs.com/package/node-minify) and `JS` with the Uglify Webpack plugin (only with `PRODUCTION` build)

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

The `PRODUCTION` build `(NODE_ENV=production)` will add the **minify** step to the process.  The **default** build will not produce a minified **JS** and also **CSS**.  

If you want to handle a dynamic configuration, you can simply check the `process.env.NODE_ENV` within the `kubozer.conf.js` (or also `webpack.config.js`) and change the ***exported*** configuration in relation to the NODE_ENV.

## Configuration

Kubozer will search for two configurations file: `kubozer.conf.js` and `webpack.config.js` (standard Webpack configuration file)

### Kubozer 
Example configuration.  **Kubozer will not assume nothing as default**.  
```javascript 
// kubozer.conf.js
module.exports = {
	workspace: './test/workspace',
	sourceFolder: './test/src-test',
	buildFolder: './test/build',
	// Relative to you workspace
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
			commentRegex: ['<!--styles!-->((.|\n)*)<!--styles!-->'],
			with: ['assets/style.min.css']
		},
		js: {
			files: 'index.html',
			commentRegex: ['<!--js!-->((.|\n)*)<!--js!-->'],
			with: ['bundle.js']
		}
	}
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
```

### Webpack
```javascript
// webpack.config.js
module.exports = {
	entry: {
		main: './src/index.js',
		// Other modules
		vendors: ['fetch', 'array-from']
	}
	output: {
		// Make sure this path is the same of the `buildFolder` of `kubozer.conf.js` if you want to build everithing in the same directory
		path: './test/build',
		// Make sure to use [name] or [id] in output.filename
		//  when using multiple entry points
		filename: '[name].bundle.js'
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

const isProd = process.env.NODE_ENV === 'production';

// Initialize (check for required config and init workspace folder)
const k = new Kubozer(config, webpackConfig);

// Sync operation
k.deletePrevBuild();

k.copy()
	.then(() => k.replace())
	.then(() => k.build(isProd))
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

### build(minify)
#### minify  
Type `boolean`  
Choose if minify the content of js files with GCC  
#### return `promise`
`Webpack` and `Vulcanize` following the configuration.


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
