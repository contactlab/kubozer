#! /usr/bin/env node

import path from 'path';

import Kubozer from './index';

const config = require(path.resolve('clab-builder.conf'));
const webpackConfig = require(path.resolve('webpack.config'));

const k = new Kubozer(config, webpackConfig);

const main = () => {
  const incArgvIndex = process.argv.indexOf('--inc');
  if (incArgvIndex === -1) {
    throw new Error('You MUST provide --inc parameter');
  }

  const semverInc = process.argv[incArgvIndex + 1]
  if (!semverInc) {
    throw new Error('You MUST provide a incremental value');
  }

  k.bump(semverInc);
}

main();
