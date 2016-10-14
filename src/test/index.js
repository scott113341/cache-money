import { promisifyAll } from 'bluebird';
import _fs from 'fs';
import path from 'path';
import test from 'tape';

import CacheMoney from '../index.js';

const fs = promisifyAll(_fs);
const name = 'TEST';

test('constructor', async t => {
  const cache = new CacheMoney();
  t.equal(typeof cache.options, 'object');
  t.equal(typeof cache._filePaths, 'object');
  t.equal(typeof cache._mtimes, 'object');
  t.equal(cache.options.name.length, 13);
  t.true(endsWith(cache.options.cachePath, 'cache-money/lib/cache'));
  t.equal(cache.options.ttl, Infinity);
  t.equal(cache.options.removeExpired, true);
  t.end();
});

test('set', async t => {
  const cache = new CacheMoney({ name });
  await cache.set('yolo.html', '<h1>cool website bro</h1>');
  const cachedContent = await fs.readFileAsync(cachePath('944be974118baf6a1d8bbe22621a0d87'), 'utf8');
  t.equal(String(cachedContent), '<h1>cool website bro</h1>');
  t.end();
});

test('get', async t => {
  const cache = new CacheMoney({ name });
  const content = await cache.get('yolo.html');
  t.equal(content.toString(), '<h1>cool website bro</h1>');
  t.end();
});

test('get (not expired)', async t => {
  const cache = new CacheMoney({ name, ttl: 2000 });
  await cache.set('yolo.html', '<h1>cool website bro</h1>');
  await wait(1000);
  const content = await cache.get('yolo.html');
  t.equal(content.toString(), '<h1>cool website bro</h1>');
  t.end();
});

test('get (expired)', async t => {
  const cache = new CacheMoney({ name, ttl: 200 });
  await cache.set('yolo.html', '<h1>cool website bro</h1>');
  await wait(1000);
  const content = await cache.get('yolo.html');
  t.equal(content, undefined);
  t.end();
});

test('get (no file)', async t => {
  const cache = new CacheMoney({ name });
  const content = await cache.get('nope.html');
  t.equal(content, undefined);
  t.end();
});

test('filePath', async t => {
  const cache = new CacheMoney({ name });
  t.equal(cache._filePaths['yee.txt'], undefined);
  t.true(endsWith(cache.filePath('yee.txt'), 'cache-money/lib/cache/80af58806b64d084b543717842c3dde1'));
  t.true(endsWith(cache._filePaths['yee.txt'], 'cache-money/lib/cache/80af58806b64d084b543717842c3dde1'));
  t.end();
});

test('mtime', async t => {
  const cache = new CacheMoney({ name });
  const before = Date.now();
  await wait(1100);
  await cache.set('yolo.html', 'asdf');
  await wait(1100);
  const after = Date.now();
  const mtime = await cache.mtime('yolo.html');

  t.true(mtime > before);
  t.true(mtime < after);
  t.true(cache._mtimes['yolo.html'] > before);
  t.true(cache._mtimes['yolo.html'] < after);
  t.end();
});

function cachePath (file) {
  return path.join(__dirname, '..', 'cache', file);
}

async function wait (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function endsWith (string, end) {
  return string.slice(0 - end.length) === end;
}
