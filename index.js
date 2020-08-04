/// <reference path="index.d.ts"/>

const mongo = './providers/josh-mongo';
const sqlite = './providers/josh-sqlite';
// const postgre = './providers/josh-postgre';
// const http = './providers/josh-http';

const {
  merge,
} = require('lodash');
// Custom error codes with stack support.
const Err = require('./error.js');

// Package.json
const pkgdata = require('./package.json');

class Josh {

  /**
   * Initalize a new Josh.
   * @constructor
   * @param {Object} options The options to initialize Josh with.
   * @param {string} options.provider The provider to use with Josh, either use a custom or an official provider.
   * @param {string} options.name The name of the Josh.
   * @example
   * const Users = new Josh({
   *    name: "Users",
   *    provider: "@josh-providers/sqlite"
   * });
   * Users.defer.then(() => {
   *    users.set("CyaCal", "AnAmazingPerson"); // Set "CyaCal" to "AnAmazingPerson"
   *    users.get("CyaCal"); // Returns "AnAmazingPerson"
   * })
   */
  constructor(options = {}) {
    const {
      provider,
      name,
    } = options;

    // Just grab the version from package.json
    this.version = pkgdata.version;
    if (['@josh-providers/mongo', '@josh-providers/postgre', '@josh-providers/http'].includes(provider)) {
      throw new Err(`The provider "${provider}" currently is not implemented in Josh yet, but will be implemented during release.`, 'ProviderNotImplemented');
    }
    // Require the provider given by the user
    const Provider = require(provider);

    // Fail miserably and weep if no provider, or no name, was given during initialization
    if (!Provider || !name) {
      throw new Err('Josh requires both a Name and Provider input ', 'JoshOptionsError');
    }

    // Verify if the provider given is an object, and is a valid provider for Josh...
    const intializedProvider = new Provider({
      name,
      ...options.options,
    });
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

    this.all = Symbol('_all');

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

  /**
   * @summary Internal Method. Verifies that the database is ready, assuming persistence is used.
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
  /**
     * @param {string} keyOrPath The key or path to get. Returns undefined if the key does not exist.
     * @see "Enmap Basics" - https://enmap.evie.dev/api#enmap-get-key-path
     * @returns {any} Value
     * @example
     * // Wait until database is loaded then query.
     * db.defer.then( () => {
     *      db.set("FavouriteFruit", "Apple");
     *      db.get("FavouriteFruit") // Returns "Apple"
     *      db.get("WorstFruit") // Returns undefined because it doesn't exist.
     * })
     */
  async get(keyOrPath) {
    this.readyCheck();
    const [key, path] = keyOrPath.split('.');
    let value = this.provider.get(key, path);
    if (this.deserializers.has(keyOrPath)) {
      value = this.deserializers.get(keyOrPath)(value);
    }
    return value;
  }
  /**
     * @param {string} key The name of the key/path to merge.
     * @param {Object} input The object to merge.
     * @see "Josh Basics" - TODO: ADD URL TO UPDATE API METHOD
     * @example
     * // Wait until database is loaded then query.
     * db.defer.then( () => {
     *      db.set("FavouriteFruit", {fruit: "Apple"}); // Set "FavouriteFruit" to "Apple"
     *      db.get("FavouriteFruit") // Returns {fruit: "Apple"}
     *      db.update("FavouriteFruit", {mouldy: true}) // Update "FavouriteFruit" to {fruit: "Apple", mouldy: true}
     *      db.get("FavouriteFruit") // Returns {fruit: "Apple", mouldy: true}
     * })
     */
  async update(key, input) {
    const previousValue = await this.get(key);
    let mergeValue = input;
    if (typeof input === 'function') {
      mergeValue = input(previousValue);
    }
    this.set(key, merge(previousValue, mergeValue));
    return this;
  }
  /**
   * @summary Get all the keys as an array.
   * @returns {Array<string>}
   */
  get keys() {
    this.readyCheck();
    return this.provider.keys();
  }
  /**
   * @summary Get all the values as an array.
   * @returns {Array<any>}
   */
  get values() {
    this.readyCheck();
    return this.provider.values();
  }
  /**
   * @summary Get the size of the Josh
   * @returns {number}
   */
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
  /**
   * @param {number} count The amount of random values you want.
   * @default count = 1
   * @returns {Array<any>}
   */
  async random(count = 1) {
    this.readyCheck();
    return this.provider.random(count);
  }
  /**
   * @param {number} count The amount of random keys you want.
   * @default count = 1
   * @returns {Array<string>}
   */
  async randomKey(count = 1) {
    this.readyCheck();
    return this.provider.randomKey(count);
  }
  /**
    * @param {string} keyOrPath The key/path to delete.
    * @see "Enmap Basics" - https://enmap.evie.dev/api#enmap-delete-key-path-enmap
    * @example
    * // Wait until database is loaded then query.
    * db.defer.then( () => {
    *      db.set("FavouriteFruit", "Apple");
    *      db.delete("FavouriteFruit"); // Deletes "FavouriteFruit" from the database
    *      db.delete(db.all) // Deletes the entire database.
    * })
    */
  async delete(keyOrPath = null) {
    this.readyCheck();
    if (keyOrPath == this.all) {
      this.provider.clear();
    } else {
      const [key, path] = keyOrPath.split('.');
      this.provider.delete(key, path);
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
  // http,
  // postgre,
};
