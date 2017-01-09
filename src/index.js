const path = require('path');

const fs = require('fs-extra');
const compressor = require('node-minify');
const webpack = require('webpack');
const Vulcanize = require('vulcanize');

const webpackConfigPath = path.resolve('webpack.config');
const configPath = path.resolve('build.conf');

const webpackConfig = require(webpackConfigPath);
const config = require(configPath);

const deletePrevBuild = () => {
  fs.removeSync(path.resolve(config.buildFolder));
  console.info('Old build removed');
};

const copyAssetsAndBundles = () => {
  config.assets.items.forEach(asset => {
    const baseAssetPath = path
      .resolve(asset)
      .slice(
        path.dirname(
          path.resolve(config.assets.base)
        ).length
      );
    const destination = path.join(path.resolve(config.buildFolder), baseAssetPath);
    fs.copy(asset, destination, err => {
      if (err) {
        console.error(err);
        return;
      }

      console.info(`Copied ${asset} to ${destination}`);
    });
  });

  config.bundles.items.forEach(bundle => {
    const baseBundlePath = path
      .resolve(bundle)
      .slice(
        path.dirname(
          path.resolve(config.bundles.base)
        ).length
      );
    const destination = path.join(path.resolve(config.buildFolder), baseBundlePath);
    fs.copy(bundle, destination, err => {
      if (err) {
        console.error(err);
        return;
      }

      console.info(`Copied ${bundle} to ${destination}`);
    });
  });
};

const compileWebpack = () => {
  webpackConfig.output.filename = './build/bundle.js';
  const compiler = webpack(webpackConfig);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
        return;
      }
      console.info('Webpack compilation completed');
      resolve(stats);
    });
  });
};

const runVulcanize = () => {
  const vulcan = new Vulcanize({
    stripComments: true,
    inlineScripts: true,
    inlineStyles: true,
    excludes: ['./app/bundle.js']
  });

  vulcan.process('./app/index.html', (err, inlinedHTML) => {
    if (err) {
      console.error(err);
      return;
    }

    fs.writeFile('./build/index.html', inlinedHTML, err => {
      if (err) {
        console.error(err);
      }

      console.info('Vulcanized index saved to ./build/index.html');
    });
  });
};

const buildCSS = () => {

};

const copyManifest = () => {
  fs.copy(config.manifest, path.resolve(path.join(config.buildFolder, 'manifest.json')));
};

const minifyJS = () => {
  const buildPath = path.resolve(config.buildJS);
  compressor.minify({
    compressor: 'gcc',
    input: buildPath,
    output: buildPath,
    callback: function (err, min) {
      if (err) {
        console.error('Minification error');
        console.error(err);
        return;
      }
      console.info('Javascript minification complete');
    }
  });
};

module.exports = {
  deletePrevBuild: deletePrevBuild,
  copyAssetsAndBundles: copyAssetsAndBundles,
  compileWebpack: compileWebpack,
  runVulcanize: runVulcanize,
  buildCSS: buildCSS,
  copyManifest: copyManifest,
  minifyJS: minifyJS
};
