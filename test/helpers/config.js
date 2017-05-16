/**
 * Manage configuration for tests.
 * @module test/helpers/config
 */

/* eslint "key-spacing": ["error", {"align": "colon"}] */

const assocPath = require('ramda/src/assocPath');
const mergeAll  = require('ramda/src/mergeAll');

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

module.exports = {
  merge: mergeAll,

  FOLDERS: {
    workspace   : './test/workspace',
    sourceFolder: './test/src-test',
    buildFolder : './test/build'
  },

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

  BUMP: {
    bump: {
      files: [
        './test/src-test/package.json',
        './test/src-test/manifest.json'
      ]
    }
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
