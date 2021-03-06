import { promisifyAll } from 'bluebird';
import crypto from 'crypto';
import _fs from 'fs';
import path from 'path';

const fs = promisifyAll(_fs);

export default class CacheMoney {

  constructor (options) {
    this.options = {
      name: Date.now().toString(),
      cachePath: path.join(__dirname, 'cache'),
      ttl: Infinity,
      removeExpired: true,
      ...options
    };
    this._filePaths = {};
    this._mtimes = {};
  }

  async set (fileName, data, { options } = {}) {
    const filePath = this.filePath(fileName);
    await fs.writeFileAsync(filePath, data, options);
    return true;
  }

  async get (fileName, { options, missing } = {}) {
    const now = Date.now();
    if (await this.isExpired(fileName, now)) {
      return this._getMissing(fileName, missing);
    } else {
      if (!await this._fileExists(fileName)) return this._getMissing(fileName, missing);
      return await fs.readFileAsync(this.filePath(fileName), options);
    }
  }

  filePath (fileName) {
    if (this._filePaths[fileName]) {
      return this._filePaths[fileName];
    } else {
      const fileHash = crypto.createHash('md5').update(this.options.name + fileName).digest('hex');
      const filePath = path.join(this.options.cachePath, fileHash);
      this._filePaths[fileName] = filePath;
      return filePath;
    }
  }

  async mtime (fileName) {
    if (!await this._fileExists(fileName)) return undefined;

    if (this._mtimes[fileName] !== undefined) {
      return this._mtimes[fileName];
    } else {
      const stat = await fs.statAsync(this.filePath(fileName));
      const mtime = stat.mtime.getTime();
      this._mtimes[fileName] = mtime;
      return mtime;
    }
  }

  async isExpired (fileName, now) {
    if (!await this._fileExists(fileName)) return true;

    const mtime = await this.mtime(fileName);
    const expired = now > mtime + this.options.ttl;
    if (expired && this.options.removeExpired) this.remove(fileName);

    return expired;
  }

  async remove (fileName) {
    delete this._filePaths[fileName];
    delete this._mtimes[fileName];
    if (!await this._fileExists(fileName)) return;
    await fs.unlinkAsync(this.filePath(fileName));
    return true;
  }

  async _fileExists (fileName) {
    try {
      await fs.statAsync(this.filePath(fileName));
      return true;
    } catch (e) {
      return false;
    }
  }

  async _getMissing (fileName, missing) {
    if (!missing) return undefined;

    const data = await missing();
    const filePath = this.filePath(fileName);
    await fs.writeFileAsync(filePath, data);
    return data;
  }

}

module.exports = CacheMoney;
