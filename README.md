# Clab build

The best tool for Contactlab projects builds

# Example configuration

```javascript
module.exports = {
  buildFolder: './build',
  buildJS: './build/bundle.js',
  manifest: './app/manifest.json',
  packageFiles: [
    'package.json',
    'bower.json',
    'app/manifest.json'
  ],
  assets: {
    base: './app/assets',
    items: [
      './app/assets/_img',
      './app/assets/css',
      './app/assets/fonts',
      './app/assets/img',
      './app/assets/profiles-test.json',
      './app/assets/profiles.json'
    ]
  },
  bundles: {
    base: './app/bundles',
    items: [
      './app/bundles'
    ]
  },
  vulcanize: {
    srcTarget: './app/index.html',
    buildTarget: './build/index.html',
    conf: {
      stripComments: true,
      inlineScripts: true,
      inlineStyles: true,
      excludes: ['./app/bundle.js']
    }
  }
};
```