'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bluebird = require('bluebird');

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _fs2 = require('fs');

var _fs3 = _interopRequireDefault(_fs2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = (0, _bluebird.promisifyAll)(_fs3.default);

var CacheMoney = function () {
  function CacheMoney(options) {
    _classCallCheck(this, CacheMoney);

    this.options = _extends({
      cacheName: Date.now().toString(),
      cachePath: _path2.default.join(__dirname, 'cache'),
      ttl: Infinity,
      removeExpired: true
    }, options);
    this._filePaths = {};
    this._mtimes = {};
  }

  _createClass(CacheMoney, [{
    key: 'set',
    value: function () {
      var _ref = _asyncToGenerator(function* (fileName, data) {
        var filePath = this.filePath(fileName);
        yield fs.writeFile(filePath, data);
      });

      function set(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return set;
    }()
  }, {
    key: 'get',
    value: function () {
      var _ref2 = _asyncToGenerator(function* (fileName) {
        var now = Date.now();
        if (yield this.isExpired(fileName, now)) {
          return undefined;
        } else {
          if (!(yield this._fileExists(fileName))) return undefined;
          return yield fs.readFileAsync(this.filePath(fileName));
        }
      });

      function get(_x3) {
        return _ref2.apply(this, arguments);
      }

      return get;
    }()
  }, {
    key: 'filePath',
    value: function filePath(fileName) {
      if (this._filePaths[fileName]) {
        return this._filePaths[fileName];
      } else {
        var fileHash = _crypto2.default.createHash('md5').update(this.options.cacheName + fileName).digest('hex');
        var filePath = _path2.default.join(this.options.cachePath, fileHash);
        this._filePaths[fileName] = filePath;
        return filePath;
      }
    }
  }, {
    key: 'mtime',
    value: function () {
      var _ref3 = _asyncToGenerator(function* (fileName) {
        if (this._mtimes[fileName] !== undefined) {
          return this._mtimes[fileName];
        } else {
          var stat = yield fs.statAsync(this.filePath(fileName));
          var _mtime = stat.mtime.getTime();
          this._mtimes[fileName] = _mtime;
          return _mtime;
        }
      });

      function mtime(_x4) {
        return _ref3.apply(this, arguments);
      }

      return mtime;
    }()
  }, {
    key: 'isExpired',
    value: function () {
      var _ref4 = _asyncToGenerator(function* (fileName, now) {
        if (!(yield this._fileExists(fileName))) return true;

        var mtime = yield this.mtime(fileName);
        var expired = now > mtime + this.options.ttl;
        if (expired && this.options.removeExpired) this.remove(fileName);

        return expired;
      });

      function isExpired(_x5, _x6) {
        return _ref4.apply(this, arguments);
      }

      return isExpired;
    }()
  }, {
    key: 'remove',
    value: function () {
      var _ref5 = _asyncToGenerator(function* (fileName) {
        delete this._filePaths[fileName];
        delete this._mtimes[fileName];
        if (!(yield this._fileExists(fileName))) return;
        yield fs.unlinkAsync(this.filePath(fileName));
      });

      function remove(_x7) {
        return _ref5.apply(this, arguments);
      }

      return remove;
    }()
  }, {
    key: '_fileExists',
    value: function () {
      var _ref6 = _asyncToGenerator(function* (fileName) {
        try {
          yield fs.statAsync(this.filePath(fileName));
          return true;
        } catch (e) {
          return false;
        }
      });

      function _fileExists(_x8) {
        return _ref6.apply(this, arguments);
      }

      return _fileExists;
    }()
  }]);

  return CacheMoney;
}();

exports.default = CacheMoney;