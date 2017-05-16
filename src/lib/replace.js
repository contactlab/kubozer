/* eslint no-negated-condition: "off" */

/**
 * Replace occurences in `index.html` file based on provided `destination`.
 * @module lib/replace
 */

import path          from 'path';
import replaceInFile from 'replace-in-file';

export const ERROR_CONF_MSG        = 'Missing configuration';
export const ERROR_REPLACEMENT_MSG = 'Missing replacement to make';

// type FromTo = {from: string[], to: string[]}

// errConf :: void -> Error
const errConf = () => new Error(ERROR_CONF_MSG);

// errReplacement :: void -> Error
const errReplacement = () => new Error(ERROR_REPLACEMENT_MSG);

// replace :: Object a -> FromTo b -> Promise
const replace = config => replacement => {
  if (!config || !replacement) {
    return Promise.reject(!config ? errConf() : errReplacement());
  }

  const options = Object.assign({
    files: path.resolve(config.buildFolder, 'index.html')
  }, replacement);

  return replaceInFile(options);
};

export default replace;
