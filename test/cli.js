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
  workspace: './test/workspace',
  sourceFolder: './test/src-test',
  buildFolder: './test/build',
  assetsFolder: 'assets',
  sourceCssFiles: ['/test.css'],
  buildCssFile: 'style.min.css',
  manifest: true,
  bump: {
    files: [
      './test/src-test/package.json',
      './test/src-test/manifest.json',
      './test/src-test/bower.json'
    ]
  },
  // Copy object NOT PRESENT
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
  expectedOutput += chalk.bold.underline.red(`\n⚠️ ERROR: ENOENT: no such file or directory, open '${__dirname}/src-test/bower.json'`);
  t.is(msg, expectedOutput);
})

test('throws param is not passed to BUMP', async t => {
  const msg = (await execa(__dirname + '/../dist/cli.js', ['--bump'])).stderr;
  let expectedOutput = chalk.red(figures.cross) + ' Bumped version.';
  expectedOutput += chalk.bold.underline.red(`\n⚠️ ERROR: BUMP(): type must be specified. This is not a valid type --> 'true'`);
  t.is(msg, expectedOutput);
})

test('throws on constructor initialization', async t => {
    const wrote = fs.writeFileSync(__dirname + '/../kubozer.conf.js', `module.exports = {
  workspace: './test/workspace',
  buildFolder: './test/build'
};`);
  const msg = (await execa(__dirname + '/../dist/cli.js', ['--bump'])).stderr;
  let expectedOutput = chalk.bold.underline.red(`\n⚠️ ERROR: Path must be a string. Received undefined --> config.sourceFolder`);
  t.is(msg, expectedOutput);
})

test('throw if `copy` object is not present', async t => {
  const wrote = fs.writeFileSync(__dirname + '/../kubozer.conf.js', `module.exports = {
  workspace: './test/workspace',
  sourceFolder: './test/src-test',
  buildFolder: './test/build',
  buildJS: 'bundle.js',
  assetsFolder: 'assets',
  sourceCssFiles: ['/test.css'],
  buildCssFile: 'style.min.css',
  manifest: true,
  bump: {
    files: [
      './test/src-test/package.json',
      './test/src-test/manifest.json'
    ]
  },
  // Copy object NOT PRESENT
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
  expectedOutput += chalk.bold.underline.red('\n⚠️ ERROR: copy() method was called but \"copy\" property is empty or undefined.');

  t.is(msg, expectedOutput)
})

test('throw if not found elment to `copy`', async t => {
  const wrote = fs.writeFileSync(__dirname + '/../kubozer.conf.js', `module.exports = {
  workspace: './test/workspace',
  sourceFolder: './test/src-test',
  buildFolder: './test/build',
  assetsFolder: 'assets',
  sourceCssFiles: ['/test.css'],
  buildCssFile: 'style.min.css',
  manifest: true,
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
        'imgs-asdasdasdasdasdasdasd'
      ]
    }, {
      baseFolder: 'bundles',
      items: []
    }
  ],
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

test('warn when webpack output.path is NOT the same of kubozer buildFolder', async t => {
  const wrote = fs.writeFileSync(__dirname + '/../kubozer.conf.js', `module.exports = {
  workspace: './test/workspace',
  sourceFolder: './test/src-test',
  buildFolder: './test/build/another',
  assetsFolder: 'assets',
  sourceCssFiles: ['/test.css'],
  buildCssFile: 'style.min.css',
  manifest: true,
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

  const msg = (await execa.shell(__dirname + '/../dist/cli.js --build'));
  let expectedOutputErr = chalk.green(figures.tick) + ' REPLACE: HTML content replaced correctly.\n';
    expectedOutputErr += chalk.green(figures.tick) + ' BUILD: Build JS and HTML completed correctly.\n';
    expectedOutputErr += chalk.green(figures.tick) + ' >> Building...\n';
    expectedOutputErr += chalk.green(figures.tick) + ' Everything works with charme 🚀';
  let expectedOutput = '\n> Started STAGING build'
  expectedOutput += chalk.underline.yellow('\n⚠️ WARNING: the "buildFolder" and the "webpackConfig.output.path" are not the same.')
  //  t.is(msg.stderr, expectedOutputErr);
   t.is(msg.stdout, expectedOutput);
  fs.removeSync(__dirname + '/build/another');
})


test('do STAGING build without NODE_ENV declared', async t => {
  const msg = (await execa(__dirname + '/../dist/cli.js', ['--build']));
  t.is(msg.stdout, '\n> Started STAGING build');
  let expectedOutput = chalk.green(figures.tick) + ' REPLACE: HTML content replaced correctly.\n';
    expectedOutput += chalk.green(figures.tick) + ' BUILD: Build JS and HTML completed correctly.\n';
    expectedOutput += chalk.green(figures.tick) + ' >> Building...\n';
    expectedOutput += chalk.green(figures.tick) + ' Everything works with charme 🚀';
  // t.is(msg.stderr, expectedOutput);
})

test('do PRODUCTION build with NODE_ENV declared', async t => {
  const msg = (await execa.shell('NODE_ENV=production ' + __dirname + '/../dist/cli.js --build'));
  t.is(msg.stdout, '\n> Started PRODUCTION build');
  let expectedOutput = chalk.green(figures.tick) + ' REPLACE: HTML content replaced correctly.\n';
    expectedOutput += chalk.green(figures.tick) + ' BUILD: Build JS and HTML completed correctly.\n';
    expectedOutput += chalk.green(figures.tick) + ' MINIFY: Minify JS and CSS completed correctly.\n';
    expectedOutput += chalk.green(figures.tick) + ' >> Building...\n';
    expectedOutput += chalk.green(figures.tick) + ' Everything works with charme 🚀';
  // t.is(msg.stderr, expectedOutput);
})

test('do build and remove workspace correctly', async t => {
  const msg = (await execa(__dirname + '/../dist/cli.js', ['--build'])).stdout
  t.false(fs.existsSync(__dirname + '/workspace'))
})

test('do BUMP', async t => {
  const msg = (await execa(__dirname + '/../dist/cli.js', ['--bump', 'major'])).stderr;
  let expectedOutput = chalk.green(figures.tick) + ' Bump from 3.0.0 to 4.0.0 completed.';
  t.is(msg, expectedOutput);
})

test('show help command when arg is not passed', async t => {
  const msg = (await execa(__dirname + '/../dist/cli.js'));
  let expectedOutput = '\n  Contactlab build utility\n';
    expectedOutput += '\n  Usage\n  \t$ [NODE_ENV=env_name] kubozer [command]\n';
    expectedOutput += '\n  Options\n  ';
    expectedOutput += '\t--build    Run the build task\n  ';
    expectedOutput += '\t--bump     Semver label for version bump: patch, minor, major, prepatch, preminor, premajor, prerelease\n  ';
    expectedOutput += '\t--i18n     Use I18N capabilities\n  ';
    expectedOutput += '\t--upload   Use ONLY with --i18n option: upload a translation file\n  ';
    expectedOutput += '\t--download Use ONLY with --i18n option: download a translation file\n';
    expectedOutput += '\n  Examples\n  \t$ NODE_ENV=production kubozer --build\n  \t$ kubozer --bump minor\n  ';
    expectedOutput += '\t$ kubozer --i18n --upload en\n  ';
    expectedOutput += '\t$ kubozer --i18n --download it';
  t.is(msg.stdout, expectedOutput);
})

test.afterEach.always(t => {
  fs.removeSync('./test/build');
  fs.copySync(__dirname + '/../kubozer.conf.js.backup', __dirname + '/../kubozer.conf.js');
  fs.removeSync(__dirname + '/../kubozer.conf.js.backup');
});
