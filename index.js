const mongo = './providers/josh-mongo';
const sqlite = './providers/josh-sqlite';

const {
  merge,
} = require('lodash');

// Custom error codes with stack support.
const Err = require('./error.js');

// Package.json
const pkgdata = require('./package.json');

class Josh {

  constructor(options = {}) {
    const {
      provider,
      name,
    } = options;

    this.version = pkgdata.version;

    const Provider = require(provider);

    if (!Provider || !name) {
      throw new Err('Josh requires both a Name and Provider input ', 'JoshOptionsError');
    }
    const intializedProvider = new Provider({ name, ...options.options });
    if (intializedProvider.constructor.name != 'JoshProvider') {
      throw new Err(`Sorry boss, that doesn't seem to be a valid Provider in your options, there. This was just a ${intializedProvider.constructor.name}!`, 'JoshOptionsError');
    }

    this.defer = new Promise(resolve => {
      this.ready = resolve;
    });

    this.provider = intializedProvider;
    this.name = name;

    this.provider.init().then(() => {
      this.ready();
      this.isReady = true;
    });
    // Initialize this property, to prepare for a possible destroy() call.
    // This is completely ignored in all situations except destroying Josh.
    this.isDestroyed = false;
  }

  /*
   * Internal Method. Verifies that the database is ready, assuming persistence is used.
   */
  readyCheck() {
    if (!this.isReady) throw new Err('Database is not ready. Refer to the documentation to use josh.defer', 'JoshReadyError');
    if (this.isDestroyed) throw new Err('This Josh has been destroyed and can no longer be used without being re-initialized.', 'JoshDestroyedError');
  }

  async set(key, value) {
    this.readyCheck();
    this.provider.keyCheck(key);
    await this.provider.set(key, value);
    return this;
  }

  async get(key) {
    this.readyCheck();
    return this.provider.get(key);
  }

  async update(key, input) {
    const previousValue = await this.get(key);
    let mergeValue = input;
    if (typeof input === 'function') {
      mergeValue = input(previousValue);
    }
    this.set(key, merge(previousValue, mergeValue));
    return this;
  }

  /* async setIn(key, path, value) {
    this.readyCheck();
    return true;
  } */

  get keys() {
    this.readyCheck();
    return this.provider.keys();
  }

  get values() {
    this.readyCheck();
    return this.provider.values();
  }

  get size() {
    this.readyCheck();
    return this.provider.count();
  }

  async has(key) {
    this.readyCheck();
    return await this.provider.has(key);
  }

  async ensure(key, defaultValue) {
    this.readyCheck();
    const hasKey = await this.has(key);
    if (!hasKey) {
      await this.set(key, defaultValue);
      return defaultValue;
    } else {
      return this.get(key);
    }
  }

  async random(count) {
    this.readyCheck();
    return this.provider.random(count);
  }

  async randomKey(count) {
    this.readyCheck();
    return this.provider.randomKey(count);
  }

  async delete(key = null) {
    this.readyCheck();
    if (key == '::all::') {
      this.provider.clear();
    } else {
      this.provider.delete(key);
    }
  }

  // ARRAY METHODS YAY

  async push(key, value, allowDupes = true) {
    this.readyCheck();
    await this.provider.push(key, value, allowDupes);
    return this;
  }

  async remove(key, value) {
    this.readyCheck();
    await this.provider.remove(key, value);
    return this;
  }

}

module.exports = Josh;
module.exports.providers = {
  mongo,
  sqlite,
};
