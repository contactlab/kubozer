/* eslint "key-spacing": ["error", {"align": "colon"}] */

import test from 'ava';
import I18n from '../dist/lib/i18n';

test('get correct filePath for language file', t => {
  const config = {
    i18n: {
      secret         : 'aaa',
      apiKey         : 'aaaa',
      projectId      : 'aaaaa',
      defaultLanguage: 'en',
      format         : 'HIERARCHICAL_JSON',
      projectID      : 94359,
      languagesPath  : './app/bundles'
    }
  };

  const i18n     = new I18n(config);
  const filePath = i18n.getFilePath(config.i18n.languagesPath, 'en');

  t.is(filePath, 'app/bundles/en.json');
});

test('get correct fileName for language file', t => {
  const config = {
    i18n: {
      secret         : 'aaa',
      apiKey         : 'aaaa',
      projectId      : 'aaaaa',
      defaultLanguage: 'en',
      format         : 'HIERARCHICAL_JSON',
      projectID      : 94359,
      languagesPath  : './app/bundles'
    }
  };

  const i18n     = new I18n(config);
  const fileName = i18n.getFileName('en');

  t.is(fileName, 'en.json');
});

test('check required i18n key in config', t => {
  t.throws(() => new I18n({}), 'In order to use OneSky integration, you need i18n configuration');
});

test('check required secret key in config', t => {
  const config = {
    i18n: {
      apiKey         : 'aaaa',
      projectId      : 'aaaaa',
      defaultLanguage: 'en',
      format         : 'HIERARCHICAL_JSON',
      projectID      : 94359,
      languagesPath  : './app/bundles'
    }
  };

  t.throws(() => new I18n(config), 'Path must be a string. Received undefined --> config.i18n.secret');
});

test('check required apiKey key in config', t => {
  const config = {
    i18n: {
      secret         : 'aaa',
      projectId      : 'aaaaa',
      defaultLanguage: 'en',
      format         : 'HIERARCHICAL_JSON',
      projectID      : 94359,
      languagesPath  : './app/bundles'
    }
  };

  t.throws(() => new I18n(config), 'Path must be a string. Received undefined --> config.i18n.apiKey');
});

test('check required projectId key in config', t => {
  const config = {
    i18n: {
      secret         : 'aaa',
      apiKey         : 'aaaa',
      defaultLanguage: 'en',
      format         : 'HIERARCHICAL_JSON',
      languagesPath  : './app/bundles'
    }
  };

  t.throws(() => new I18n(config), 'Path must be a string. Received undefined --> config.i18n.projectId');
});

test('check required defaultLanguage key in config', t => {
  const config = {
    i18n: {
      secret       : 'aaa',
      apiKey       : 'aaaa',
      projectId    : 'aaaaa',
      format       : 'HIERARCHICAL_JSON',
      projectID    : 94359,
      languagesPath: './app/bundles'
    }
  };

  t.throws(() => new I18n(config), 'Path must be a string. Received undefined --> config.i18n.defaultLanguage');
});

test('check required format key in config', t => {
  const config = {
    i18n: {
      secret         : 'aaa',
      apiKey         : 'aaaa',
      projectId      : 'aaaaa',
      defaultLanguage: 'en',
      projectID      : 94359,
      languagesPath  : './app/bundles'
    }
  };

  t.throws(() => new I18n(config), 'Path must be a string. Received undefined --> config.i18n.format');
});

test('check required languagesPath key in config', t => {
  const config = {
    i18n: {
      secret         : 'aaa',
      apiKey         : 'aaaa',
      projectId      : 'aaaaa',
      defaultLanguage: 'en',
      format         : 'HIERARCHICAL_JSON'
    }
  };

  t.throws(() => new I18n(config), 'Path must be a string. Received undefined --> config.i18n.languagesPath');
});
