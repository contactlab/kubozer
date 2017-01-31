import fs from 'fs-extra';
import test from 'ava';
import execa from 'execa';

test('throw if some problem in conf', async t => {
	const copied = fs.copySync(__dirname + '/../kubozer.conf.js', __dirname + '/../kubozer.conf.js.backup');
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

  t.is(msg, 'olol')
})

test('do staging build without NODE_ENV declared', async t => {
	const copied = fs.copySync(__dirname + '/../kubozer.conf.js', __dirname + '/../kubozer.conf.js.backup');
	const msg = (await execa(__dirname + '/../dist/cli.js', ['--build'])).stdout
  t.true(msg.search('resWebpack') > -1)
  t.true(msg.search('resVulcanize') > -1)
})

test.afterEach.always(t => {
  fs.removeSync('./test/build');
  fs.copySync(__dirname + '/../kubozer.conf.js.backup', __dirname + '/../kubozer.conf.js');
  fs.removeSync(__dirname + '/../kubozer.conf.js.backup');
});