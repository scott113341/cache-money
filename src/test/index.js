import { promisifyAll } from 'bluebird';
import _fs from 'fs';
import path from 'path';
import test from 'tape';

import CacheMoney from '../index.js';

const fs = promisifyAll(_fs);
const name = 'test';

test('constructor', async t => {
  const cache = new CacheMoney();
  t.equal(typeof cache.options, 'object');
  t.equal(typeof cache._filePaths, 'object');
  t.equal(typeof cache._mtimes, 'object');
  t.equal(cache.options.name.length, 13);
  t.equal(endOfPath(cache.options.cachePath, 3), 'cache-money/lib/cache');
  t.equal(cache.options.ttl, Infinity);
  t.equal(cache.options.removeExpired, true);
  t.end();
});

test('constructor (with options)', async t => {
  const cache = new CacheMoney({
    name,
    cachePath: path.join(__dirname, 'cash'),
    ttl: 123,
    removeExpired: false
  });
  t.equal(typeof cache.options, 'object');
  t.equal(typeof cache._filePaths, 'object');
  t.equal(typeof cache._mtimes, 'object');
  t.equal(cache.options.name, 'test');
  t.equal(endOfPath(cache.options.cachePath, 4), 'cache-money/lib/test/cash');
  t.equal(cache.options.ttl, 123);
  t.equal(cache.options.removeExpired, false);
  t.end();
});

test('set', async t => {
  const cache = new CacheMoney({ name: 'test' });
  await cache.set('yolo.html', '<h1>cool website bro</h1>');
  const cachedContent = await fs.readFileAsync(cachePath('c25378864b85f0d409ea781ff8071ed2'));
  t.equal(String(cachedContent), '<h1>cool website bro</h1>');
  t.end();
});

test('get', async t => {
  const cache = new CacheMoney();
  await cache.set('yolo.html', '<h1>cool website bro</h1>');
  const content = await cache.get('yolo.html');
  t.equal(content.toString(), '<h1>cool website bro</h1>');
  t.end();
});

test('get (not expired)', async t => {
  const cache = new CacheMoney({ ttl: 2000 });
  await cache.set('yolo', '<h1>cool website bro</h1>');
  await wait(1000);
  const content = await cache.get('yolo');
  t.equal(content.toString(), '<h1>cool website bro</h1>');
  t.end();
});

test('get (expired)', async t => {
  const cache = new CacheMoney({ ttl: 200 });
  await cache.set('yolo', '<h1>cool website bro</h1>');
  await wait(1000);
  const content = await cache.get('yolo');
  t.equal(content, undefined);
  t.end();
});

test('get (missing)', async t => {
  const cache = new CacheMoney();
  const content = await cache.get('yolo.html');
  t.equal(content, undefined);
  t.end();
});

test('get (missing + callback)', async t => {
  t.plan(2);
  function missing () {
    t.equal(true, true, 'should get called');
    return 'yeezee';
  }

  const cache = new CacheMoney();
  const content = await cache.get('missing.html', { missing });
  t.equal(content.toString(), 'yeezee');
});

test('filePath', async t => {
  const cache = new CacheMoney({ name });
  t.equal(cache._filePaths['yee.txt'], undefined);
  t.equal(endOfPath(cache.filePath('yee.txt'), 4), 'cache-money/lib/cache/8af1f12e9875614b38d56be178ba7dc5');
  t.equal(endOfPath(cache._filePaths['yee.txt'], 4), 'cache-money/lib/cache/8af1f12e9875614b38d56be178ba7dc5');
  t.end();
});

test('mtime', async t => {
  const cache = new CacheMoney();
  const before = Date.now();
  await wait(2000);
  await cache.set('yolo', 'asdf');
  await wait(2000);
  const after = Date.now();
  const mtime = await cache.mtime('yolo');

  t.equal(mtime > before, true);
  t.equal(mtime < after, true);
  t.equal(cache._mtimes['yolo'] > before, true);
  t.equal(cache._mtimes['yolo'] < after, true);
  t.end();
});

test('remove', async t => {
  const cache = new CacheMoney();
  await cache.set('yolo', 'asdf');
  await wait(2000);
  t.equal(await cache._fileExists('yolo'), true);
  t.equal(String(await cache.get('yolo')), 'asdf');
  t.equal(await cache.remove('yolo'), true);
  t.equal(await cache._fileExists('yolo'), false);
  t.end();
});

test('operations on nonexistent file', async t => {
  const cache = new CacheMoney();
  t.equal(await cache.get('swag'), undefined);
  t.equal(await cache.mtime('swag'), undefined);
  t.equal(await cache.isExpired('swag'), true);
  t.equal(await cache.remove('swag'), undefined);
  t.equal(await cache._fileExists('swag'), false);
  t.end();
});

function cachePath (file) {
  return path.join(__dirname, '..', 'cache', file);
}

async function wait (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function endOfPath (string, segments = 0) {
  return string.split(path.sep).slice(-segments).join(path.sep);
}
