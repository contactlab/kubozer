#! /usr/bin/env node
'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = require(_path2.default.resolve('clab-builder.conf'));
var webpackConfig = require(_path2.default.resolve('webpack.config'));

var k = new _index2.default(config, webpackConfig);

var main = function main() {
  var incArgvIndex = process.argv.indexOf('--inc');
  if (incArgvIndex === -1) {
    throw new Error('You MUST provide --inc parameter');
  }

  var semverInc = process.argv[incArgvIndex + 1];
  if (!semverInc) {
    throw new Error('You MUST provide a incremental value');
  }

  k.bump(semverInc);
};

main();