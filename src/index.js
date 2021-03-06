/**
 * Kubozer - ContactLab build tool.
 * @module index
 */

'use strict';

import path          from 'path';
import fs            from 'fs-extra';
import semver        from 'semver';
import replaceInFile from 'replace-in-file';
import objOf         from 'ramda/src/objOf';

import {success, error} from './lib/result';
import Builder          from './lib/builder';
import Minifier         from './lib/minifier';
import OneSky           from './lib/i18n';

const COPY_COMPLETED    = 'Copy completed.';
const COPY_ERROR        = 'copy() method was called but "copy" property is empty or undefined.';
const REPLACE_COMPLETED = 'Replace-in-file completed.';

class Kubozer {
  constructor(config, webpackConfig) {
    if (!config || !webpackConfig) {
      throw new Error('Missing configurations.');
    }

    this.config = config;
    this.webpackConfig = webpackConfig;
    this._checkForRequired();

    this.Builder = new Builder(this.config, this.webpackConfig);
    this.Minifier = new Minifier(this.config);

    // Ensure no previous workspaces are present
    this.deleteWorkspace();
  }

  deleteWorkspace() {
    try {
      fs.removeSync(path.resolve(this.config.workspace));
    } catch (err) {
      throw new Error(err);
    }
  }

  deletePrevBuild() {
    try {
      const pathToBuild = path.resolve(this.config.buildFolder);
      fs.removeSync(path.resolve(pathToBuild));
    } catch (err) {
      throw new Error(err);
    }
  }

  /**
   * {string} type: 'assets' || 'bundles'
   *
   */
  copy() {
    this._ensureWorkspace();

    return new Promise((resolve, reject) => {
      if (this.config.manifest) {
        this._copyManifest();
      }

      if (this.config.copy) {
        this.config.copy.forEach(type => {
          type.items.forEach(item => {
            try {
              const itemPath = path.join(
                path.resolve(this.config.workspace),
                type.baseFolder,
                item
              );
              const destination = path.join(
                path.resolve(this.config.buildFolder),
                type.baseFolder,
                item
              );

              fs.copySync(itemPath, destination);

              return resolve(success(COPY_COMPLETED, {itemPath, destination}));
            } catch (err) {
              return reject(err);
            }
          });
        });
      }

      // If "copy" is empty
      reject(error(COPY_ERROR));
    });
  }

  replace() {
    this._ensureWorkspace();

    const optionCSS = {};
    const optionJS = {};

    if (this.config.replace && this.config.replace.css) {
      const cssFiles = this.config.replace.css.files;
      optionCSS.files = path.join(
        path.resolve(this.config.workspace),
        cssFiles
      );
      optionCSS.from = this.config.replace.css.commentRegex.map(item => {
        return new RegExp(item, 'g');
      });
      optionCSS.to = this.config.replace.css.with.map(item => {
        return `
        <link rel="stylesheet" href="${item}" />
        `;
      });
    }

    if (this.config.replace && this.config.replace.js) {
      optionJS.files = path.join(
        path.resolve(this.config.workspace),
        this.config.replace.js.files
      );
      optionJS.from = this.config.replace.js.commentRegex.map(item => {
        return new RegExp(item, 'g');
      });
      optionJS.to = this.config.replace.js.with.map(item => {
        return `
        <script src="${item}"></script>
        `;
      });
    }

    if (optionJS.files === undefined && optionCSS.files === undefined) {
      throw new Error('WARNING REPLACE(): replace method called but "files" not found in configuration');
    }

    return new Promise((resolve, reject) => {
      try {
        const changedCSS = replaceInFile.sync(optionCSS);
        const changedJS  = replaceInFile.sync(optionJS);

        return resolve(success(REPLACE_COMPLETED, {changedCSS, changedJS}));
      }	catch (err) {
        reject(error(err));
      }
    });
  }

  build(minify) {
    this._ensureWorkspace();

    const intoAs = (key, xs) => data => xs.concat(objOf(key, data));

    return Promise.resolve([])
            .then(result =>
              this.Builder.webpack(minify).then(intoAs('resWebpack', result))
            )
            .then(result =>
              this.Builder.vulcanize().then(intoAs('resVulcanize', result))
            )
            .then(result =>
              minify ?
                this.Minifier.minifyCSS().then(intoAs('resMinifiedCss', result)) :
                result
            )
            .then(result =>
              minify ?
                this.Builder.hashed().then(intoAs('resHashed', result)) :
                result
            )
            .then(result =>
              result.reduce((acc, r) => Object.assign({}, acc, r), {})
            )
            .catch(err => {
              throw err;
            });
  }

  bump(type) {
    return new Promise((resolve, reject) => {
      const types    = ['patch', 'minor', 'major', 'prepatch', 'preminor', 'premajor', 'prerelease'];
      const notAType = types.indexOf(type) === -1;

      if (type === null || type === undefined || typeof type !== 'string' || notAType) {
        return reject(error(`BUMP(): type must be specified. This is not a valid type --> '${type}'`));
      }

      let oldVersion = '';
      let newVersion = '';

      const dataFiles = this.config.bump.files.reduce((acc, filePath) => {
        const fullFilePath = path.resolve(filePath);
        const data         = JSON.parse(fs.readFileSync(fullFilePath, 'utf8'));
        const old          = data.version;

        data.version = semver.inc(data.version, type);
        oldVersion = old;
        newVersion = data.version;

        const dataString = JSON.stringify(data, null, 2);

        fs.writeFileSync(fullFilePath, dataString);

        return acc.concat(data);
      }, []);

      return resolve(success(`Bump from ${oldVersion} to ${newVersion} completed.`, dataFiles));
    });
  }

  upload(language) {
    /* istanbul ignore next */
    const oneSky = new OneSky(this.config);
    /* istanbul ignore next */
    return oneSky.upload(language);
  }

  download(languages) {
    /* istanbul ignore next */
    const oneSky = new OneSky(this.config);
    /* istanbul ignore next */
    return oneSky.download(languages);
  }

  _createWorkspace() {
    try {
      const pathWorkspace = path.resolve(this.config.workspace);

      fs.ensureDirSync(pathWorkspace);
      fs.copySync(path.resolve(this.config.sourceFolder), pathWorkspace);
    } catch (err) {
      throw new Error(err);
    }
  }

  _ensureWorkspace() {
    if (fs.existsSync(path.resolve(this.config.workspace))) {
      return true;
    }

    this._createWorkspace();
  }

  _copyManifest() {
    this._ensureWorkspace();

    try {
      const pathManifest     = path.resolve(path.join(this.config.workspace, 'manifest.json'));
      const pathManifestDist = path.resolve(path.join(this.config.buildFolder, 'manifest.json'));
      const exist            = fs.existsSync(pathManifest);

      if (exist) {
        fs.copySync(pathManifest, pathManifestDist);

        return true;
      }

      return false;
    } catch (err) {
      throw new Error(err);
    }
  }

  _pathErrHandler(entity) {
    const err = new Error();
    const msg = 'Path must be a string. Received undefined';

    err.message = `${msg} --> ${entity}`;

    return err;
  }

  _checkForRequired() {
    if (!this.config.workspace || this.config.workspace === '') {
      throw this._pathErrHandler('config.workspace');
    }

    if (!this.config.sourceFolder || this.config.sourceFolder === '') {
      throw this._pathErrHandler('config.sourceFolder');
    }

    if (!this.config.buildFolder || this.config.buildFolder === '') {
      throw this._pathErrHandler('config.buildFolder');
    }

    if (!this.config.buildJS || this.config.buildJS === '') {
      this.config.buildJS = 'bundle.js';
    }

    if (!this.config.copy) {
      this.config.copy = [];
    }
  }
}

export default Kubozer;
