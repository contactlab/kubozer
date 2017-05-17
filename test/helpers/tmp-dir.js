/**
 * Creates a temporary directory coping it from a template.
 * @module test/helpers/tmp-dir
 */

const crypto = require('crypto');
const path   = require('path');
const fs     = require('fs-extra');

// hash :: String -> String
const hash = str =>
  crypto
    .createHash('sha256')
    .update(str)
    .digest('hex')
    .substr(0, 8);

// tmpDir :: (String, String) -> Promise<String>
const tmpDir = (from, name) => {
  const dir  = path.dirname(from);
  const base = path.basename(from);
  const tmp  = path.join(dir, hash(name));

  return fs.copy(from, path.join(tmp, base)).then(() => tmp);
};

module.exports = tmpDir;
