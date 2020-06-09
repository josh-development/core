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

    // Just grab the version from package.json
    this.version = pkgdata.version;

    // Require the provider given by the user
    const Provider = require(provider);

    // Fail miserably and weep if no provider, or no name, was given during initialization
    if (!Provider || !name) {
      throw new Err('Josh requires both a Name and Provider input ', 'JoshOptionsError');
    }

    // Verify if the provider given is an object, and is a valid provider for Josh...
    const intializedProvider = new Provider({ name, ...options.options });
    if (intializedProvider.constructor.name != 'JoshProvider') {
      throw new Err(`Sorry boss, that doesn't seem to be a valid Provider in your options, there. This was just a ${intializedProvider.constructor.name}!`, 'JoshOptionsError');
    }

    // Create a function that will be resolved whenever the provider's database is connected.
    this.defer = new Promise(resolve => {
      this.ready = resolve;
    });

    // Configure shit
    this.provider = intializedProvider;
    this.name = name;

    this.serializers = new Map();
    this.deserializers = new Map();

    // Grab serializers and deserializers from the options if they exist.
    if (options.serializers) {
      options.serializers.forEach(serializer => {
        this.serializers.set(serializer.name, serializer.function);
      });
    }

    if (options.deserializers) {
      options.deserializers.forEach(deserializer => {
        this.deserializers.set(deserializer.name, deserializer.function);
      });
    }

    // Connect the provider to its database.
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

  async set(keyOrPath, value) {
    this.readyCheck();
    const [key, path] = keyOrPath.split('.');
    this.provider.keyCheck(key);
    if (this.serializers.has(keyOrPath)) {
      value = this.serialisers.get(keyOrPath)(value);
    }
    await this.provider.set(key, path, value);
    return this;
  }

  async get(keyOrPath) {
    this.readyCheck();
    const [key, path] = keyOrPath.split('.');
    let value = this.provider.get(key, path);
    if (this.deserializers.has(keyOrPath)) {
      value = this.deserializers.get(keyOrPath)(value);
    }
    return value;
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

  async inc(key) {
    this.readyCheck();
    await this.provider.inc(key);
    return this;
  }

  async dec(key) {
    this.readyCheck();
    await this.provider.dec(key);
    return this;
  }

}

module.exports = Josh;
module.exports.providers = {
  mongo,
  sqlite,
};
