const path = require('path');

module.exports = {
  workspace   : path.join(__dirname, 'workspace'),
  sourceFolder: path.join(__dirname, 'src'),
  buildFolder : path.join(__dirname, 'build'),

  assetsFolder  : 'assets',
  sourceCssFiles: ['/test.css'],
  buildCssFile  : 'style.min.css',

  manifest: true,

  stripConsole: true,

  bump: {
    files: [
      path.join(__dirname, 'src/package.json'),
      path.join(__dirname, 'src/manifest.json')
    ]
  },

  copy: [
    {
      baseFolder: 'assets',
      items     : ['imgs-others']
    }, {
      baseFolder: 'bundles',
      items     : ['']
    }
  ],

  replace: {
    css: {
      files       : 'index.html',
      commentRegex: ['<!--styles!--->((.|\n)*)<!--styles!--->'],
      with        : ['assets/style.min.css']
    },
    js: {
      files       : 'index.html',
      commentRegex: ['<!--js!--->((.|\n)*)<!--js!--->'],
      with        : ['bundle.js']
    }
  },

  vulcanize: {
    srcTarget  : 'index.html',
    buildTarget: 'index.html',
    conf       : {
      stripComments: true,
      inlineScripts: true,
      inlineStyles : true,
      excludes     : ['bundle.js']
    }
  },

  i18n: {
    secret         : 'aaa',
    apiKey         : 'aaaa',
    projectId      : 'aaaaa',
    defaultLanguage: 'en',
    format         : 'HIERARCHICAL_JSON',
    languagesPath  : './app/bundles'
  }
};
