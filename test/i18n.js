import test from 'ava';
import Fn from './../dist/lib/i18n';

test('get correct filePath for language file', async t => {
  const config = {
    i18n: {
      secret: 'aaa',
      apiKey: 'aaaa',
      projectId: 'aaaaa',
      defaultLanguage: 'en',
      format: 'HIERARCHICAL_JSON',
      projectID: 94359,
      languagesPath: './app/bundles'
    }
  };
  const fn = new Fn(config);
  const filePath = fn.getFilePath(config.i18n.languagesPath, 'en');
  t.is(filePath, 'app/bundles/en.json');
});

test('get correct fileName for language file', async t => {
  const config = {
    i18n: {
      secret: 'aaa',
      apiKey: 'aaaa',
      projectId: 'aaaaa',
      defaultLanguage: 'en',
      format: 'HIERARCHICAL_JSON',
      projectID: 94359,
      languagesPath: './app/bundles'
    }
  };
  const fn = new Fn(config);
  const fileName = fn.getFileName('en');
  t.is(fileName, 'en.json');
});

test('check required i18n key in config', t => {
  const config = {};

  const err = t.throws(() => {
    new Fn(config)
  }, 'In order to use OneSky integration, you need i18n configuration');
});

test('check required secret key in config', t => {
  const config = {
    i18n: {
      apiKey: 'aaaa',
      projectId: 'aaaaa',
      defaultLanguage: 'en',
      format: 'HIERARCHICAL_JSON',
      projectID: 94359,
      languagesPath: './app/bundles'
    }
  };

  const err = t.throws(() => {
    new Fn(config)
  }, 'Path must be a string. Received undefined --> config.i18n.secret');
});

test('check required apiKey key in config', t => {
  const config = {
    i18n: {
      secret: 'aaa',
      projectId: 'aaaaa',
      defaultLanguage: 'en',
      format: 'HIERARCHICAL_JSON',
      projectID: 94359,
      languagesPath: './app/bundles'
    }
  };

  const err = t.throws(() => {
    new Fn(config)
  }, 'Path must be a string. Received undefined --> config.i18n.apiKey');
});

test('check required projectId key in config', t => {
  const config = {
    i18n: {
      secret: 'aaa',
      apiKey: 'aaaa',
      defaultLanguage: 'en',
      format: 'HIERARCHICAL_JSON',
      languagesPath: './app/bundles'
    }
  };

  const err = t.throws(() => {
    new Fn(config)
  }, 'Path must be a string. Received undefined --> config.i18n.projectId');
});

test('check required defaultLanguage key in config', t => {
  const config = {
    i18n: {
      secret: 'aaa',
      apiKey: 'aaaa',
      projectId: 'aaaaa',
      format: 'HIERARCHICAL_JSON',
      projectID: 94359,
      languagesPath: './app/bundles'
    }
  };

  const err = t.throws(() => {
    new Fn(config)
  }, 'Path must be a string. Received undefined --> config.i18n.defaultLanguage');
});

test('check required format key in config', t => {
  const config = {
    i18n: {
      secret: 'aaa',
      apiKey: 'aaaa',
      projectId: 'aaaaa',
      defaultLanguage: 'en',
      projectID: 94359,
      languagesPath: './app/bundles'
    }
  };

  const err = t.throws(() => {
    new Fn(config)
  }, 'Path must be a string. Received undefined --> config.i18n.format');
});

test('check required languagesPath key in config', t => {
  const config = {
    i18n: {
      secret: 'aaa',
      apiKey: 'aaaa',
      projectId: 'aaaaa',
      defaultLanguage: 'en',
      format: 'HIERARCHICAL_JSON',
    }
  };

  const err = t.throws(() => {
    new Fn(config)
  }, 'Path must be a string. Received undefined --> config.i18n.languagesPath');
});
