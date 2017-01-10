const path = require('path');

const fs = require('fs-extra');
const compressor = require('node-minify');
const webpack = require('webpack');
const Vulcanize = require('vulcanize');

const webpackConfigPath = path.resolve('webpack.config');
const configPath = path.resolve('clab-builder.conf');

const webpackConfig = require(webpackConfigPath);
const config = require(configPath);

const bump = require('./bump');

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
  webpackConfig.output.filename = config.buildJS;
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
  const vulcan = new Vulcanize(config.vulcanize.conf);

  vulcan.process(config.vulcanize.srcTarget, (err, inlinedHTML) => {
    if (err) {
      console.error(err);
      return;
    }

    fs.writeFile(config.vulcanize.buildTarget, inlinedHTML, err => {
      if (err) {
        console.error(err);
      }

      console.info('Vulcanized index saved to ' + config.vulcanize.buildTarget);
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
  minifyJS: minifyJS,
  inc: bump.inc
};
