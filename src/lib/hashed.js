/**
 * Create an hashed version of static resources provided by configuration.
 * @module lib/hashed
 */

/* eslint "key-spacing": ["error", {"align": "colon"}], new-cap: ["error", { "properties": false }] */

import path     from 'path';
import hashmark from 'hashmark';
import pify     from 'pify';
import concat   from 'ramda/src/concat';
import map      from 'ramda/src/map';
import Either   from 'data.either';

const pHashmark = pify(hashmark);

export const ERROR_NO_CONFIG        = 'Missing configurations.';
export const ERROR_FILENAME_TPL_STR = '`input` use an unsupported template string';
const ERROR_NO_TPL_STR              = '`input` is not a template string';

const REGEXP               = /\[(\w+)\]/i;
const SUPPORTED_TPL        = '[name]';
const DEFAULT_REPLACEMENTS = ['main'];

const OPTIONS = {
  digest : 'sha256',
  length : 8,
  pattern: '{dir}/{name}-{hash}{ext}',
  cwd    : '.',
  rename : true
};

// type ReplaceData = {tpl: string, input: string}
// isMulti :: * -> boolean
const isMulti = a => (typeof a === 'object' && !Array.isArray(a));
// err :: string -> Error
const err = type => new Error(type);
// replace :: (ReplaceData, [string]) -> [string]
const replaceWith = (a, xs) => xs.map(x => a.input.replace(a.tpl, x));
// inDir :: string -> string -> string
const inDir = dir => file => path.join(dir, file);
// isTplStr :: string -> boolean
const isTplStr = s => REGEXP.test(s);
// config :: Object a -> Either(Error, Object a)
const config = c => Either.fromNullable(c).leftMap(() => err(ERROR_NO_CONFIG));

/* istanbul ignore next */
// match :: string -> Either(Error, string)
const match = a =>
  Either
    .fromNullable(a.match(REGEXP))
    .leftMap(() => err(ERROR_NO_TPL_STR));

// supported :: [string] -> Either(Error, ReplaceData)
const supported = as =>
  as[0] === SUPPORTED_TPL ?
    Either.Right({tpl: as[0], input: as.input}) :
    Either.Left(err(ERROR_FILENAME_TPL_STR));

// withReplace :: Object -> ReplaceData -> [string]
const withReplace = b => a =>
  replaceWith(a, isMulti(b) ? Object.keys(b) : DEFAULT_REPLACEMENTS);

// remapTplString :: (Object, string) -> Either(Error, string)
const remapTplString = (b, a) =>
  match(a).chain(supported).map(withReplace(b));

// bundle :: (Object, string) -> Either(Error, [string])
const bundle = (a, s) =>
  isTplStr(s) ? remapTplString(a, s) : Either.of([s]);

// program :: Object -> Either(Error, [string])
const scripts = c =>
  config(c)
    .chain(c =>
      bundle(c.entry, c.output.filename)
        .map(map(inDir(c.output.path)))
    );

// program2 :: Object -> Either(Error, [string])
const styles = c =>
  config(c)
    .map(c => [path.join(c.buildFolder, c.assetsFolder, c.buildCssFile)]);

// hashed :: (Object, Object) -> Promise
const hashed = (config, webpackconfig) =>
  Either
    .of(concat)
    .ap(styles(config))
    .ap(scripts(webpackconfig))
    .cata({
      Left : l => Promise.reject(l),
      Right: r => pHashmark(r, OPTIONS)
    });

export default hashed;
