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
      oneskyProjectID: 94359,
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
      oneskyProjectID: 94359,
      languagesPath: './app/bundles'
    }
	};
  const fn = new Fn(config);
  const fileName = fn.getFileName('en');
  t.is(fileName, 'en.json');
});
