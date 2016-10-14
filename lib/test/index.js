'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var wait = function () {
  var _ref11 = _asyncToGenerator(function* (ms) {
    return new Promise(function (resolve) {
      return setTimeout(resolve, ms);
    });
  });

  return function wait(_x11) {
    return _ref11.apply(this, arguments);
  };
}();

var _bluebird = require('bluebird');

var _fs2 = require('fs');

var _fs3 = _interopRequireDefault(_fs2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _tape = require('tape');

var _tape2 = _interopRequireDefault(_tape);

var _index = require('../index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var fs = (0, _bluebird.promisifyAll)(_fs3.default);
var name = 'test';

(0, _tape2.default)('constructor', function () {
  var _ref = _asyncToGenerator(function* (t) {
    var cache = new _index2.default();
    t.equal(_typeof(cache.options), 'object');
    t.equal(_typeof(cache._filePaths), 'object');
    t.equal(_typeof(cache._mtimes), 'object');
    t.equal(cache.options.name.length, 13);
    t.equal(endOfPath(cache.options.cachePath, 3), 'cache-money/lib/cache');
    t.equal(cache.options.ttl, Infinity);
    t.equal(cache.options.removeExpired, true);
    t.end();
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());

(0, _tape2.default)('constructor (with options)', function () {
  var _ref2 = _asyncToGenerator(function* (t) {
    var cache = new _index2.default({
      name: name,
      cachePath: _path2.default.join(__dirname, 'cash'),
      ttl: 123,
      removeExpired: false
    });
    t.equal(_typeof(cache.options), 'object');
    t.equal(_typeof(cache._filePaths), 'object');
    t.equal(_typeof(cache._mtimes), 'object');
    t.equal(cache.options.name, 'test');
    t.equal(endOfPath(cache.options.cachePath, 4), 'cache-money/lib/test/cash');
    t.equal(cache.options.ttl, 123);
    t.equal(cache.options.removeExpired, false);
    t.end();
  });

  return function (_x2) {
    return _ref2.apply(this, arguments);
  };
}());

(0, _tape2.default)('set', function () {
  var _ref3 = _asyncToGenerator(function* (t) {
    var cache = new _index2.default({ name: 'test' });
    yield cache.set('yolo.html', '<h1>cool website bro</h1>');
    var cachedContent = yield fs.readFileAsync(cachePath('c25378864b85f0d409ea781ff8071ed2'));
    t.equal(String(cachedContent), '<h1>cool website bro</h1>');
    t.end();
  });

  return function (_x3) {
    return _ref3.apply(this, arguments);
  };
}());

(0, _tape2.default)('get', function () {
  var _ref4 = _asyncToGenerator(function* (t) {
    var cache = new _index2.default();
    yield cache.set('yolo.html', '<h1>cool website bro</h1>');
    var content = yield cache.get('yolo.html');
    t.equal(content.toString(), '<h1>cool website bro</h1>');
    t.end();
  });

  return function (_x4) {
    return _ref4.apply(this, arguments);
  };
}());

(0, _tape2.default)('get (not expired)', function () {
  var _ref5 = _asyncToGenerator(function* (t) {
    var cache = new _index2.default({ ttl: 2000 });
    yield cache.set('yolo', '<h1>cool website bro</h1>');
    yield wait(1000);
    var content = yield cache.get('yolo');
    t.equal(content.toString(), '<h1>cool website bro</h1>');
    t.end();
  });

  return function (_x5) {
    return _ref5.apply(this, arguments);
  };
}());

(0, _tape2.default)('get (expired)', function () {
  var _ref6 = _asyncToGenerator(function* (t) {
    var cache = new _index2.default({ ttl: 200 });
    yield cache.set('yolo', '<h1>cool website bro</h1>');
    yield wait(1000);
    var content = yield cache.get('yolo');
    t.equal(content, undefined);
    t.end();
  });

  return function (_x6) {
    return _ref6.apply(this, arguments);
  };
}());

(0, _tape2.default)('filePath', function () {
  var _ref7 = _asyncToGenerator(function* (t) {
    var cache = new _index2.default({ name: name });
    t.equal(cache._filePaths['yee.txt'], undefined);
    t.equal(endOfPath(cache.filePath('yee.txt'), 4), 'cache-money/lib/cache/8af1f12e9875614b38d56be178ba7dc5');
    t.equal(endOfPath(cache._filePaths['yee.txt'], 4), 'cache-money/lib/cache/8af1f12e9875614b38d56be178ba7dc5');
    t.end();
  });

  return function (_x7) {
    return _ref7.apply(this, arguments);
  };
}());

(0, _tape2.default)('mtime', function () {
  var _ref8 = _asyncToGenerator(function* (t) {
    var cache = new _index2.default();
    var before = Date.now();
    yield wait(2000);
    yield cache.set('yolo', 'asdf');
    yield wait(2000);
    var after = Date.now();
    var mtime = yield cache.mtime('yolo');

    t.equal(mtime > before, true);
    t.equal(mtime < after, true);
    t.equal(cache._mtimes['yolo'] > before, true);
    t.equal(cache._mtimes['yolo'] < after, true);
    t.end();
  });

  return function (_x8) {
    return _ref8.apply(this, arguments);
  };
}());

(0, _tape2.default)('remove', function () {
  var _ref9 = _asyncToGenerator(function* (t) {
    var cache = new _index2.default();
    yield cache.set('yolo', 'asdf');
    t.equal((yield cache._fileExists('yolo')), true);
    t.equal(String((yield cache.get('yolo'))), 'asdf');
    t.equal((yield cache.remove('yolo')), true);
    t.equal((yield cache._fileExists('yolo')), false);
    t.end();
  });

  return function (_x9) {
    return _ref9.apply(this, arguments);
  };
}());

(0, _tape2.default)('operations on nonexistent file', function () {
  var _ref10 = _asyncToGenerator(function* (t) {
    var cache = new _index2.default();
    t.equal((yield cache.get('swag')), undefined);
    t.equal((yield cache.mtime('swag')), undefined);
    t.equal((yield cache.isExpired('swag')), true);
    t.equal((yield cache.remove('swag')), undefined);
    t.equal((yield cache._fileExists('swag')), false);
    t.end();
  });

  return function (_x10) {
    return _ref10.apply(this, arguments);
  };
}());

function cachePath(file) {
  return _path2.default.join(__dirname, '..', 'cache', file);
}

function endOfPath(string) {
  var segments = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  return string.split(_path2.default.sep).slice(-segments).join(_path2.default.sep);
}