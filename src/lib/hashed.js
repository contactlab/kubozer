/**
 * Create an hashed version of static resources provided by configuration.
 * @module lib/hashed
 */

/* eslint "key-spacing": ["error", {"align": "colon"}] */

import path     from 'path';
import hashmark from 'hashmark';
import pify     from 'pify';

export const ERROR_MSG = 'Missing configurations.';

const pHashmark = pify(hashmark);

const OPTIONS = {
  digest : 'sha256',
  length : 8,
  pattern: '{dir}/{name}-{hash}{ext}',
  cwd    : '.',
  rename : true
};

// hashed :: (Object, Object) -> Promise
const hashed = (config, webpackconfig) => {
  if (!config || !webpackconfig) {
    return Promise.reject(new Error(ERROR_MSG));
  }

  const {buildFolder, assetsFolder, buildCssFile} = config;
  const {path: bundleDir, filename: bundleFile} = webpackconfig.output;

  const files = [
    path.join(buildFolder, assetsFolder, buildCssFile),
    path.join(bundleDir, bundleFile)
  ];

  return pHashmark(files, OPTIONS);
};

export default hashed;
