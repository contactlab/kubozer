import fs from 'fs-extra';
import test from 'ava';
import execa from 'execa';
import figures from 'figures';
import chalk from 'chalk';

test.beforeEach(t => {
		const copied = fs.copySync(__dirname + '/../kubozer.conf.js', __dirname + '/../kubozer.conf.js.backup');
});

test('throws when a file is not found during BUMP', async t => {
	const wrote = fs.writeFileSync(__dirname + '/../kubozer.conf.js', `module.exports = {
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
		'test/bower.json',
		'app/manifest.json'
	],
	// Copy object NOT PRESENT
	
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
	}
};`);
	const msg = (await execa(__dirname + '/../dist/cli.js', ['--bump', 'major'])).stderr;
	let expectedOutput = chalk.red(figures.cross) + ' Bumped version.';
	expectedOutput += chalk.bold.underline.red(`\n⚠️ ERROR: ENOENT: no such file or directory, open '${__dirname}/bower.json'`);
	t.is(msg, expectedOutput);
})

test('throws param is not passed to BUMP', async t => {
	const msg = (await execa(__dirname + '/../dist/cli.js', ['--bump'])).stderr;
	let expectedOutput = chalk.red(figures.cross) + ' Bumped version.';
	expectedOutput += chalk.bold.underline.red(`\n⚠️ ERROR: BUMP(): type must be specified. This is not a valid type --> 'true'`);
	t.is(msg, expectedOutput);
})

test('throw if `copy` object is not present', async t => {
	const wrote = fs.writeFileSync(__dirname + '/../kubozer.conf.js', `module.exports = {
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
		'bower.json',
		'app/manifest.json'
	],
	// Copy object NOT PRESENT
	
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
	}
};`);

	const msg = (await execa.shell('NODE_ENV=production ' +__dirname + '/../dist/cli.js --build')).stderr;
	
	let expectedOutput = chalk.red(figures.cross) + ' COPY: Files copied correctly.';
	expectedOutput += chalk.bold.underline.red('\n⚠️ ERROR: copy() method was called but \"copy\" property is empty.');

  t.is(msg, expectedOutput)
})

test('throw if not found elment to `copy`', async t => {
	const wrote = fs.writeFileSync(__dirname + '/../kubozer.conf.js', `module.exports = {
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
	// Copy object NOT PRESENT
	copy: [
		{
			base: 'assets',
			items: [
				'imgs-asdasdasdasdasdasdasd'
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
			commentRegex: ['<!--styles!--->((.|)*)<!--styles!--->'],
			with: ['assets/style.min.css']
		},
		js: {
			files: 'index.html',
			commentRegex: ['<!--js!--->((.|)*)<!--js!--->'],
			with: ['bundle.js']
		}
	}
};`);

	const msg = (await execa.shell(__dirname + '/../dist/cli.js --build')).stderr;	
	let expectedOutput = chalk.red(figures.cross) + ' COPY: Files copied correctly.';
	expectedOutput += chalk.bold.underline.red(`\n⚠️ ERROR: ENOENT: no such file or directory, stat '${__dirname}/workspace/assets/imgs-asdasdasdasdasdasdasd'`);
  t.is(msg, expectedOutput)
})

// test('throw if `vulcanize` object is not present', async t => {
// 	const copied = fs.copySync(__dirname + '/../kubozer.conf.js', __dirname + '/../kubozer.conf.js.backup');
// 	const wrote = fs.writeFileSync(__dirname + '/../kubozer.conf.js', `module.exports = {
// 	// Temporary workspace for build
// 	workspace: './test/workspace',
// 	// Where all the source app is stored
// 	sourceApp: './test/src-test',
// 	// Build folder name
// 	buildFolder: './test/build',
// 	// Build JS name for bundle (OPTIONAL)(default: bunlde.js)
// 	buildJS: 'bundle.js',
// 	// Assets for source and build
// 	assetsFolderName: 'assets',
// 	srcCSS: ['/test.css'],
// 	buildCSS: 'style.min.css',
// 	// Copy or not the manifest
// 	manifest: true,
// 	// Package files where search for bump version
// 	packageFiles: [
// 		'package.json',
// 		'bower.json',
// 		'app/manifest.json'
// 	],
// 	// Copy object
// 	copy: [
// 		{
// 			base: 'assets',
// 			items: [
// 				'imgs-others'
// 			]
// 		}, {
// 			base: 'bundles',
// 			items: [
// 				''
// 			]
// 		}
// 	],
// 	// Replace object 
// 	replace: {
// 		css: {
// 			files: 'index.html',
// 			commentRegex: ['<!--styles!--->((.|\n)*)<!--styles!--->'],
// 			with: ['assets/style.min.css']
// 		},
// 		js: {
// 			files: 'index.html',
// 			commentRegex: ['<!--js!--->((.|\n)*)<!--js!--->'],
// 			with: ['bundle.js']
// 		}
// 	}
// 	// Vulcanize object NOT PRESENT
// };`);

// 	const msg = (await execa.shell('NODE_ENV=production ' +__dirname + '/../dist/cli.js --build')).stderr;
	
// 	let expectedOutput = chalk.red(figures.cross) + ' COPY: Files copied correctly.';
// 	expectedOutput += '\nERROR: copy() method was called but \"copy\" property is empty.';

//   t.is(msg, expectedOutput)
// })

test('do STAGING build without NODE_ENV declared', async t => {
	const msg = (await execa(__dirname + '/../dist/cli.js', ['--build']));
	t.is(msg.stdout, '\n# Started STAGING build');
	let expectedOutput = chalk.green(figures.tick) + ' REPLACE: HTML content replaced correctly.\n';
		expectedOutput += chalk.green(figures.tick) + ' BUILD: Build JS and HTML completed correctly.\n';
		expectedOutput += chalk.green(figures.tick) + ' ## Building...\n';
		expectedOutput += chalk.green(figures.tick) + ' Everything works with charme 🚀';
	t.is(msg.stderr, expectedOutput);
})

test('do PRODUCTION build with NODE_ENV declared', async t => {
	const msg = (await execa.shell('NODE_ENV=production ' + __dirname + '/../dist/cli.js --build'));
	t.is(msg.stdout, '\n# Started PRODUCTION build');
	let expectedOutput = chalk.green(figures.tick) + ' REPLACE: HTML content replaced correctly.\n';
		expectedOutput += chalk.green(figures.tick) + ' BUILD: Build JS and HTML completed correctly.\n';
		expectedOutput += chalk.green(figures.tick) + ' MINIFY: Minify JS and CSS completed correctly.\n';
		expectedOutput += chalk.green(figures.tick) + ' ## Minifying...\n';
		expectedOutput += chalk.green(figures.tick) + ' Everything works with charme 🚀';
	t.is(msg.stderr, expectedOutput);
})

test('do build and remove workspace correctly', async t => {
	const msg = (await execa(__dirname + '/../dist/cli.js', ['--build'])).stdout
  t.false(fs.existsSync(__dirname + '/workspace'))
})

test('do BUMP', async t => {
	const msg = (await execa(__dirname + '/../dist/cli.js', ['--bump', 'major'])).stderr;
	let expectedOutput = chalk.green(figures.tick) + ' Bump from 2.0.0 to 3.0.0 completed.';
	t.is(msg, expectedOutput);
})

test.afterEach.always(t => {
  fs.removeSync('./test/build');
  fs.copySync(__dirname + '/../kubozer.conf.js.backup', __dirname + '/../kubozer.conf.js');
  fs.removeSync(__dirname + '/../kubozer.conf.js.backup');
});