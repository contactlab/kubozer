#! /usr/bin/env node
'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = require(_path2.default.resolve('clab-builder.conf'));
var webpackConfig = require(_path2.default.resolve('webpack.config'));

var NODE_ENV = process.env.NODE_ENV;

var isProduction = function isProduction() {
  return NODE_ENV === 'production';
};

var isStaging = function isStaging() {
  return NODE_ENV === 'staging';
};

var k = new _index2.default(config, webpackConfig);

var buildStaging = function buildStaging() {
  k.deletePrevBuild(function () {});
  k.copy().then(function () {
    return k.build();
  });
};

var buildProduction = function buildProduction() {
  k.deletePrevBuild(function () {});
  k.copy().then(function () {
    return k.build();
  }).then(function () {
    return k.minify();
  });
};

var main = function main() {
  if (isStaging()) {
    buildStaging();
  }

  if (isProduction()) {
    buildProduction();
  }
};

main();