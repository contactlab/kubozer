/**
 * Creates a Kubozer configuration file
 * @module test/helpers/kubozer-conf
 */

const fs   = require('fs-extra');
const path = require('path');

module.exports = (dir, config) =>
  fs.writeFile(path.join(dir, 'kubozer.conf.js'), `module.exports = ${JSON.stringify(config)};`);
