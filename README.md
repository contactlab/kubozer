# Kubozer

> The best tool for Contactlab projects builds :rocket:

#### 🚧 WorkInProgress 🚧

## Install

	$ yarn add kubozer

## Configuration
```javascript
// kubozer.conf.js
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
```

## CLI

### kubozer

```bash
  Usage
    $ NODE_ENV=env_name kubozer --build
    $ NODE_ENV=env_name kubozer --bump semverlabel

  Options
  --bump Semver label for version bump: patch, minor, major, prepatch, preminor, premajor, prerelease

  Examples
    $ NODE_ENV=staging kubozer --build
    $ NODE_ENV=staging kubozer --bump minor
```


## Usage
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

## Webpack configuration
```javascript

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


## Development

	$ git clone https://github.com/contactlab/kubozer.git#development
	$ yarn

### Build

	$ yarn run build

### Testing
> XO as linter and AVA for units.

	$ yarn test

## TODO
- add `test` command
- add `oneskyapp` (or whatever) command

- test for `bump` command
- code refactor
- review
- (more and more...)


### Git branching policies
Any feature/bug fixing/refactor must be developed on a **feature branch** derived from the **develop** branch and integrate the changes through a **pull request** to have a code review.

### License
Released under the [Apache 2.0](LICENSE) license.
