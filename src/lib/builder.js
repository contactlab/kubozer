/**
 * Builds with Webpack and vulcanize index.html
 * @module lib/builder
 */

'use strict';

import path                  from 'path';
import fs                    from 'fs-extra';
import webpack               from 'webpack';
import WebpackNotifierPlugin from 'webpack-notifier';
import Vulcanize             from 'vulcanize';

import {success, error} from './result';

const WEBPACK_COMPLETED   = 'Webpack compilation completed';
const VULCANIZE_COMPLETED = 'Vulcanize completed.';
const VULCANIZE_NO_CONF   = 'Vulcanize configuration is not present. ---> config.vulcanize === undefined';

export default class Builder {
  constructor(config, webpackConfig) {
    this.config = config;
    this.webpackConfig = webpackConfig;
  }

  webpack(minify) {
    return new Promise((resolve, reject) => {
      fs.ensureDirSync(this.config.buildFolder);

      if (minify) {
        const uglify = new webpack.optimize.UglifyJsPlugin({
          comments: false,
          compress: {
            warnings: false,
            /* eslint-disable camelcase */
            drop_console: this.config.stripConsole
          },
          sourceMap: true
        });

        this.webpackConfig.plugins = this.webpackConfig.plugins ? this.webpackConfig.plugins.concat(uglify) : [uglify];
        this.webpackConfig.plugins = this.webpackConfig.plugins.concat(new WebpackNotifierPlugin({
          title: 'Kubozer - Webpack',
          contentImage: path.join(__dirname, './../../', 'Kubozer_Sign@2x.png')
        }));
      }

      try {
        const compiler = webpack(this.webpackConfig);
        compiler.run(err => {
          if (err) {
            return reject(error(err));
          }

          return resolve(success(WEBPACK_COMPLETED, [{completed: true}]));
        });
      } catch (err) {
        return reject(error(err.message, err.name));
      }
    });
  }

  vulcanize() {
    return new Promise((resolve, reject) => {
      if (this.config.vulcanize === undefined) {
        reject(error(VULCANIZE_NO_CONF));
      }

      const vulcan = new Vulcanize(this.config.vulcanize.conf);

      const workspaceIndex = path.join(
        path.resolve(this.config.workspace),
        this.config.vulcanize.srcTarget
      );
      const buildIndex = path.join(
        path.resolve(this.config.buildFolder),
        this.config.vulcanize.buildTarget
      );

      vulcan.process(workspaceIndex, (err, inlinedHTML) => {
        if (err) {
          const msg = `${err.message} | Did you checked the "excludes" property of "vulcanize" configuration?`;

          return reject(error(err.message.search('no such file') > -1 ? msg : err.message));
        }

        fs.ensureFileSync(buildIndex);
        fs.writeFile(buildIndex, inlinedHTML, err => {
          if (err) {
            return reject(err);
          }

          return resolve(success(VULCANIZE_COMPLETED, buildIndex));
        });
      });
    });
  }
}
