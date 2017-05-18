/**
 * Manage configuration for tests.
 * @module test/helpers/config
 */

/* eslint "key-spacing": ["error", {"align": "colon"}] */

const path      = require('path');
const assocPath = require('ramda/src/assocPath');
const compose   = require('ramda/src/compose');
const when      = require('ramda/src/when');
const contains  = require('ramda/src/contains');
const flip      = require('ramda/src/flip');
const merge     = require('ramda/src/merge');
const prop      = require('ramda/src/prop');
const is        = require('ramda/src/is');

// has :: [a] -> a -> Boolean
const has = flip(contains);

// readOrExec :: (*, String, Object) -> *
const readOrExec = (p, k, o) => compose(when(is(Function), a => a(p)), prop(k))(o);

const VULCANIZE = {
  vulcanize: {
    srcTarget  : 'index.html',
    buildTarget: 'index.html',
    conf       : {
      stripComments: true,
      inlineScripts: true,
      inlineStyles : true
    }
  }
};

const CONFIG = {
  FOLDERS: dir => ({
    workspace   : path.join(dir, 'workspace'),
    sourceFolder: path.join(dir, 'src'),
    buildFolder : path.join(dir, 'build')
  }),

  BUMP: dir => ({
    bump: {
      files: [
        path.join(dir, 'src/package.json'),
        path.join(dir, 'src/manifest.json')
      ]
    }
  }),

  VULCANIZE,

  VULCANIZE_NO_JS: assocPath(
    ['vulcanize', 'conf', 'excludes'],
    ['javascript.js'],
    VULCANIZE
  ),

  VULCANIZE_NO_BUNDLE: assocPath(
    ['vulcanize', 'conf', 'excludes'],
    ['bundle-fake.js', 'js.js'],
    VULCANIZE
  ),

  COPY: {
    copy: [{
      baseFolder: 'assets',
      items     : ['imgs-others']
    }, {
      baseFolder: 'bundles',
      items     : ['']
    }]
  },

  REPLACE: {
    replace: {
      css: {
        files       : 'index.html',
        commentRegex: ['<!--styles!--->((.|\n)*)<!--styles!--->'],
        with        : ['/assets/style.css']
      },
      js: {
        files       : 'index.html',
        commentRegex: ['<!--js!--->((.|\n)*)<!--js!--->'],
        with        : ['/assets/javascript.js']
      }
    }
  },

  MANIFEST: {
    manifest: true
  },

  CSS: {
    assetsFolder  : 'assets',
    sourceCssFiles: ['/test.css'],
    buildCssFile  : 'style.min.css'
  },

  STRIPCONSOLE: {
    stripConsole: true
  }
};

module.exports = (dir, keys = []) =>
  Object
    .keys(CONFIG)
    .filter(has(keys))
    .reduce((acc, key) => merge(acc, readOrExec(dir, key, CONFIG)), {});
