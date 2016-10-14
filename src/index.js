import { promisifyAll } from 'bluebird';
import crypto from 'crypto';
import _fs from 'fs';
import path from 'path';

const fs = promisifyAll(_fs);

export default class CacheMoney {

  constructor (options) {
    this.options = {
      cacheName: Date.now().toString(),
      cachePath: path.join(__dirname, 'cache'),
      ttl: Infinity,
      removeExpired: true,
      ...options
    };
    this._filePaths = {};
    this._mtimes = {};
  }

  async set (fileName, data) {
    const filePath = this.filePath(fileName);
    await fs.writeFile(filePath, data);
  }

  async get (fileName) {
    const now = Date.now();
    if (await this.isExpired(fileName, now)) {
      if (this.options.removeExpired) this.remove(fileName);
      return undefined;
    } else {
      return await fs.readFileAsync(this.filePath(fileName));
    }
  }

  filePath (fileName) {
    if (this._filePaths[fileName]) {
      return this._filePaths[fileName];
    } else {
      const fileHash = crypto.createHash('md5').update(this.options.cacheName + fileName).digest('hex');
      const filePath = path.join(this.options.cachePath, fileHash);
      this._filePaths[fileName] = filePath;
      return filePath;
    }
  }

  async mtime (fileName) {
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
    const mtime = await this.mtime(fileName);
    return now > mtime + this.options.ttl;
  }

  async remove (fileName) {
    const filePath = this.filePath(fileName);
    delete this._filePaths[fileName];
    delete this._mtimes[fileName];
    return await fs.unlinkAsync(filePath);
  }

}
