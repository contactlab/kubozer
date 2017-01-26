import fs from 'fs-extra';
import test from 'ava';
import execa from 'execa';

test('do staging build without NODE_ENV declared', async t => {
	const msg = (await execa(__dirname + '/../dist/cli.js', ['--build'])).stdout
  t.true(msg.search('resWebpack') > -1)
  t.true(msg.search('resVulcanize') > -1)
})

test.afterEach.always(t => {
  fs.removeSync('./test/build');
});