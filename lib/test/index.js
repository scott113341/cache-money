'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var wait = function () {
  var _ref8 = _asyncToGenerator(function* (ms) {
    return new Promise(function (resolve) {
      return setTimeout(resolve, ms);
    });
  });

  return function wait(_x8) {
    return _ref8.apply(this, arguments);
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
var cacheName = 'TEST';

(0, _tape2.default)('constructor', function () {
  var _ref = _asyncToGenerator(function* (t) {
    var cache = new _index2.default();
    t.equal(_typeof(cache.options), 'object');
    t.true(endsWith(cache.options.cachePath, 'cache-money/lib/cache'));
    t.true(_typeof(cache.expirationTimes), 'object');
    t.end();
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());

(0, _tape2.default)('set', function () {
  var _ref2 = _asyncToGenerator(function* (t) {
    var cache = new _index2.default({ cacheName: cacheName });
    yield cache.set('yolo.html', '<h1>cool website bro</h1>');
    var cachedContent = yield fs.readFileAsync(cachePath('944be974118baf6a1d8bbe22621a0d87'), 'utf8');
    t.equal(String(cachedContent), '<h1>cool website bro</h1>');
    t.end();
  });

  return function (_x2) {
    return _ref2.apply(this, arguments);
  };
}());

(0, _tape2.default)('get', function () {
  var _ref3 = _asyncToGenerator(function* (t) {
    var cache = new _index2.default({ cacheName: cacheName });
    var content = yield cache.get('yolo.html');
    t.equal(content.toString(), '<h1>cool website bro</h1>');
    t.end();
  });

  return function (_x3) {
    return _ref3.apply(this, arguments);
  };
}());

(0, _tape2.default)('get (not expired)', function () {
  var _ref4 = _asyncToGenerator(function* (t) {
    var cache = new _index2.default({ cacheName: cacheName, ttl: 2000 });
    yield cache.set('yolo.html', '<h1>cool website bro</h1>');
    yield wait(1000);
    var content = yield cache.get('yolo.html');
    t.equal(content.toString(), '<h1>cool website bro</h1>');
    t.end();
  });

  return function (_x4) {
    return _ref4.apply(this, arguments);
  };
}());

(0, _tape2.default)('get (expired)', function () {
  var _ref5 = _asyncToGenerator(function* (t) {
    var cache = new _index2.default({ cacheName: cacheName, ttl: 200 });
    yield cache.set('yolo.html', '<h1>cool website bro</h1>');
    yield wait(1000);
    var content = yield cache.get('yolo.html');
    t.equal(content, undefined);
    t.end();
  });

  return function (_x5) {
    return _ref5.apply(this, arguments);
  };
}());

(0, _tape2.default)('filePath', function () {
  var _ref6 = _asyncToGenerator(function* (t) {
    var cache = new _index2.default({ cacheName: cacheName });
    t.equal(cache._filePaths['yee.txt'], undefined);
    t.true(endsWith(cache.filePath('yee.txt'), 'cache-money/lib/cache/80af58806b64d084b543717842c3dde1'));
    t.true(endsWith(cache._filePaths['yee.txt'], 'cache-money/lib/cache/80af58806b64d084b543717842c3dde1'));
    t.end();
  });

  return function (_x6) {
    return _ref6.apply(this, arguments);
  };
}());

(0, _tape2.default)('mtime', function () {
  var _ref7 = _asyncToGenerator(function* (t) {
    var cache = new _index2.default({ cacheName: cacheName });
    var before = Date.now();
    yield wait(1100);
    yield cache.set('yolo.html', 'asdf');
    yield wait(1100);
    var after = Date.now();
    var mtime = yield cache.mtime('yolo.html');

    t.true(mtime > before);
    t.true(mtime < after);
    t.true(cache._mtimes['yolo.html'] > before);
    t.true(cache._mtimes['yolo.html'] < after);
    t.end();
  });

  return function (_x7) {
    return _ref7.apply(this, arguments);
  };
}());

function cachePath(file) {
  return _path2.default.join(__dirname, '..', 'cache', file);
}

function endsWith(string, end) {
  return string.slice(0 - end.length) === end;
}