#! /usr/bin/env node

import path from 'path';

import Kubozer from './index';

const config = require(path.resolve('clab-builder.conf'));
const webpackConfig = require(path.resolve('webpack.config'));

const NODE_ENV = process.env.NODE_ENV;

const isProduction = () => {
  return NODE_ENV === 'production';
};

const isStaging = () => {
  return NODE_ENV === 'staging';
};

const k = new Kubozer(config, webpackConfig);

const buildStaging = () => {
  k.deletePrevBuild(() => {});
  k.copy().then(() => k.build());
};

const buildProduction = () => {
  k.deletePrevBuild(() => {});
  k.copy()
    .then(() => k.build())
    .then(() => k.minify());
};

const main = () => {
  if (isStaging()) {
    buildStaging();
  }

  if (isProduction()) {
    buildProduction();
  }
};

main();
