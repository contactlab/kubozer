/**
 * Creates an hashed version of resources and replace references in `index.html`
 * @module lib/hashed-resources
 */

import compose from 'ramda/src/compose';

import hashed       from './hashed';
import relativeTo   from './relative-to';
import distribution from './distribution';
import fromTo       from './from-to';
import replace      from './replace';

export const SUCCESS_MSG = 'Hashing resources completed';
export const ERROR_MSG   = 'Missing configurations.';

// hashedResources :: (Object, Object) -> Promise
const hashedResources = (config, webpackconfig) =>
  (!config || !webpackconfig) ?
    Promise.reject(ERROR_MSG) :
    hashed(config, webpackconfig)
      .then(compose(fromTo, distribution, relativeTo(config.buildFolder)))
      .then(replace(config))
      .then(() => SUCCESS_MSG);

export default hashedResources;
