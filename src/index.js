const {
  merge,
} = require('lodash');

// Custom error codes with stack support.
const Err = require('./error.js');

// Package.json
const pkgdata = require('../package.json');

class Josh {

  /**
   * Initializes a new Josh, with options.
   * @param {Object} [options] Additional options an configurations.
   * @param {string} [options.name] Required. The name of the table in which to save the data.
   * @param {string} [options.provider] Required. A string with the name of the provider to use. Should not be already required,
   * as Josh takes care of doing that for you. *Must* be a valid provider that complies with the Provider API.
   * The provider needs to be installed separately with yarn or npm. See https://josh.evie.dev/providers for details.
   * @param {boolean} [options.ensureProps] defaults to `true`. If enabled and an inserted value is an object, using ensure() will also ensure that
   * every property present in the default object will be added to the value, if it's absent.
   * @param {*} [options.autoEnsure] default is disabled. When provided a value, essentially runs ensure(key, autoEnsure) automatically so you don't have to.
   * This is especially useful on get(), but will also apply on set(), and any array and object methods that interact with the database.
   * @param {Function} [options.serializer] Optional. If a function is provided, it will execute on the data when it is written to the database.
   * This is generally used to convert the value into a format that can be saved in the database, such as converting a complete class instance to just its ID.
   * This function may return the value to be saved, or a promise that resolves to that value (in other words, can be an async function).
   * @param {Function} [options.deserializer] Optional. If a function is provided, it will execute on the data when it is read from the database.
   * This is generally used to convert the value from a stored ID into a more complex object.
   * This function may return a value, or a promise that resolves to that value (in other words, can be an async function).
   * @example
   * const Josh = require("josh");
   *
   * // sqlite-based database, with default options
   * const sqliteDB = new Josh({
   *   name: 'mydatabase',
   *   provider: '@josh-providers/sqlite',
   * });
   */
  constructor(options = {}) {
    const {
      provider,
      name,
      providerOptions,
    } = options;

    // Just grab the version from package.json
    this.version = pkgdata.version;

    // Require the provider given by the user
    const Provider = require(provider);

    // Fail miserably and weep if no provider, or no name, was given during initialization
    if (!Provider || !name) {
      throw new Err('Josh requires both a "name" and "provider" given in the options.', 'JoshOptionsError');
    }

    // Verify if the provider given is an object, and is a valid provider for Josh...
    const intializedProvider = new Provider({ name, ...providerOptions });
    if (intializedProvider.constructor.name != 'JoshProvider') {
      throw new Err(`The given Provider does not seem valid. I expected JoshProvider, but this was a ${intializedProvider.constructor.name}!`, 'JoshOptionsError');
    }

    // Create a function that will be resolved whenever the provider's database is connected.
    this.defer = new Promise(resolve => {
      this.ready = resolve;
    });

    // Configure shit
    this.provider = intializedProvider;
    this.name = name;

    this.all = Symbol('_all');
    this.off = Symbol('_off');

    this.serializer = options.serializer;
    this.deserializer = options.deserializer;

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
  async readyCheck() {
    await this.defer;
    if (this.isDestroyed) throw new Err('This Josh has been destroyed and can no longer be used without being re-initialized.', 'JoshDestroyedError');
  }

  /**
   * Store a value in the database. If a simple key is provided, creates or overwrites the entire value with the new one provide.
   * If a path is provided, and the stored value is an object, only the value at the path will be overwritten.
   * @param {string} keyOrPath Either a key, or a full path, where you want to store the value.
   * For more information on how path works, see https://josh.evie.dev/path
   * @param {*} value The value to store for the key, or in the path, specified.
   * All values MUST be "simple" javascript values: Numbers, Booleans, Strings, Arrays, Objects.
   * If you want to store a "complex" thing such as an instance of a class, please use a Serializer to convert it to a storable value.
   * @return {Promise<Josh>} This database wrapper, useful if you want to chain more instructions for Josh.
   */
  async set(keyOrPath, value) {
    await this.readyCheck();
    const [key, ...path] = keyOrPath.split('.');
    this.provider.keyCheck(key);
    await this.provider.set(key, path, this.serializer ? this.serializer(value) : value);
    return this;
  }

  /**
   * Retrieves (fetches) a value from the database. If a simple key is provided, returns the value.
   * If a path is provided, will only return the value at that path, if it exists.
   * @param {string} keyOrPath Either a key, or full path, of the value you want to get.
   * For more information on how path works, see https://josh.evie.dev/path
   * @return {Promise<*>} Returns the value for the key or the value found at the specified path.
   */
  async get(keyOrPath) {
    await this.readyCheck();
    if (keyOrPath == this.all) {
      const allValues = await this.provider.getAll();
      return this.deserializer ? allValues.map(this.deserializer) : allValues;
    }
    const [key, ...path] = keyOrPath.split('.');
    const hasKey = await this.has(keyOrPath);
    const value = !hasKey && this.autoEnsure !== this.off ? await this.ensure(keyOrPath) : await this.provider.get(key, path);
    return this.deserializer ? this.deserializers(value) : value;
  }

  /**
   * Update an object in the database with modified values. Similar to set() except it does not overwrite the entire object.
   * Instead, the data is *merged* with the existing object. Object properties not included in your data are not touched.
   * @param {string} keyOrPath Either a key, or full path, of the value you want to update.
   * @param {Object|Function} input Either the object, or a function. If a function is provided,
   * it will receive the *current* value as an argument. You are expected to return a modified object that will be stored in the database.
   * @return {Promise<Object>} The merged object that will be stored in the database.
   * @example
   * josh.set('thing', {
   *   a: 1,
   *   b: 2,
   *   c: 3
   * });
   * josh.merge('thing', {
   *   a: 'one',
   *   d: 4
   * });
   * // value is now {a: 'one', b: 2, c: 3, d: 4}
   *
   * josh.merge('thing', (previousValue) => {
   *   ...previousValue,
   *   b: 'two',
   *   e: 5,
   * });
   * // value is now {a: 'one', b: 'two', c: 3, d: 4, e: 5}
   */
  async update(keyOrPath, input) {
    const previousValue = await this.get(keyOrPath);
    let mergeValue = input;
    if (typeof input === 'function') {
      mergeValue = input(previousValue);
    }
    this.set(keyOrPath, merge(previousValue, mergeValue));
    return this;
  }

  /**
   * Get all the keys in the database.
   * @return {Promise<Array.String>} An array of all the keys as string values.
   */
  get keys() {
    return this.readyCheck().then(() => this.provider.keys());
  }

  /**
  * Get all the values in the database.
  * @return {Promise<Array>} An array of all the values stored in the database.
  */
  get values() {
    return this.readyCheck().then(() => this.provider.values());
  }

  /**
   * Get the amount of rows inside the database.
   * @return {Promise<integer>} An integer equal to the amount of stored key/value pairs.
   */
  get size() {
    return this.readyCheck().then(() => this.provider.count());
  }

  /**
   * Verifies whether a key, or a specific property of an object, exists at all.
   * @param {string} keyOrPath Either a key, or full path, of the value you want to get.
   * For more information on how path works, see https://josh.evie.dev/path
   * @return {Promise<boolean>} Whether the key, or property specified in the path, exists.
   */
  async has(keyOrPath) {
    await this.readyCheck();
    const [key, ...path] = keyOrPath.split('.');
    return await this.provider.has(key, path);
  }

  /**
   * Returns the key's value, or the default given, ensuring that the data is there.
   * This is a shortcut to "if josh doesn't have key, set it, then get it" which is a very common pattern.
   * @param {string} keyOrPath Either a key, or full path, of the value you want to ensure.
   * @param {*} defaultValue Required. The value you want to save in the database and return as default.
   * @example
   * // Simply ensure the data exists (for using property methods):
   * josh.ensure("mykey", {some: "value", here: "as an example"});
   * josh.has("mykey"); // always returns true
   * josh.get("mykey", "here") // returns "as an example";
   *
   * // Get the default value back in a variable:
   * const settings = mySettings.ensure("1234567890", defaultSettings);
   * console.log(settings) // josh's value for "1234567890" if it exists, otherwise the defaultSettings value.
   * @return {Promise<*>} The value from the database for the key, or the default value provided for a new key.
   */
  async ensure(keyOrPath, defaultValue) {
    await this.readyCheck();
    const hasKey = await this.has(keyOrPath);
    if (!hasKey) {
      await this.set(keyOrPath, defaultValue);
      return defaultValue;
    } else {
      return this.get(keyOrPath);
    }
  }

  /**
   * Returns one or more random values from the database.
   * @param {integer} count Defaults to 1. The number of random key/value pairs to get.
   * @return {Promise<Array.<Array>>} An array of key/value pairs each in their own array.
   * The array of values should never contain duplicates. If the requested count is higher than the number
   * of rows in the database, only the available number of rows will be returned, in randomized order.
   * Each array element is comprised of the key and value: [['a', 1], ['b', 2], ['c', 3]]
   */
  async random(count) {
    await this.readyCheck();
    return this.provider.random(count);
  }

  /**
  * Returns one or more random keys from the database.
  * @param {integer} count Defaults to 1. The number of random key/value pairs to get.
  * @return {Promise<Array.<string>>} An array of string keys in a randomized order.
  * The array of keys should never contain duplicates. If the requested count is higher than the number
  * of rows in the database, only the available number of rows will be returned.
  */
  async randomKey(count) {
    await this.readyCheck();
    return this.provider.randomKey(count);
  }

  /**
   * Remove a key/value pair, or the property and value at a specific path, or clear the database.
   * @param {string} keyOrPath Either a key, or full path, of the value you want to delete.
   * If providing a path, only the value located at the path is deleted.
   * Alternatively: josh.delete(josh.all) will clear the database of all data.
   * @return {Promise<Josh>} This database wrapper, useful if you want to chain more instructions for Josh.
   */
  async delete(keyOrPath = null) {
    await this.readyCheck();
    if (keyOrPath == this.all) {
      await this.provider.clear();
    } else {
      const [key, ...path] = keyOrPath.split('.');
      await this.provider.delete(key, path);
    }
    return this;
  }

  /**
   * Add a new value to an array.
   * @param {string} keyOrPath Either a key, or full path, where the array where you want to add a value.
   * @param {*} value The value to add to the array.
   * @param {boolean} allowDupes Whether to allow duplicate values to be added. Note that if you're pushing objects or arrays,
   * duplicates can occur no matter what, as detecting duplicate objects is CPU-intensive.
   * @return {Promise<Josh>} This database wrapper, useful if you want to chain more instructions for Josh.
   */
  async push(keyOrPath, value, allowDupes = true) {
    await this.readyCheck();
    const [key, ...path] = keyOrPath.split('.');
    await this.provider.push(key, path, value, allowDupes);
    return this;
  }

  /**
   * Remove a value from an array, by value (simple values like strings and numbers) or function (complex values like arrays or objects).
   * @param {*} keyOrPath Either a key, or full path, where the array where you want to remove from, is stored.
   * @param {*|Function} value Required. The value to remove from the array. OR a function to match a value stored in the array.
   * If using a function, the function provides the value and must return a boolean that's true for the value you want to remove.
   * @return {Promise<Josh>} This database wrapper, useful if you want to chain more instructions for Josh.
   * @example
   * // Assuming
   * josh.set('array', [1, 2, 3])
   * josh.set('objectarray', [{ a: 1, b: 2, c: 3 }, { d: 4, e: 5, f: 6 }])
   *
   * josh.remove('array', 1); // value is now [2, 3]
   * josh.remove('objectarray', (value) => value.e === 5); // value is now [{ a: 1, b: 2, c: 3 }]
   */
  async remove(keyOrPath, value) {
    await this.readyCheck();
    const [key, ...path] = keyOrPath.split('.');
    await this.provider.remove(key, path, value);
    return this;
  }

  /**
   * Increments (adds 1 to the number) the stored value.
   * @param {*} keyOrPath  Either a key, or full path, to the value you want to increment. The value must be a number.
   * @return {Promise<Josh>} This database wrapper, useful if you want to chain more instructions for Josh.
   */
  async inc(keyOrPath) {
    await this.readyCheck();
    const [key, ...path] = keyOrPath.split('.');
    await this.provider.inc(key, path);
    return this;
  }

  /**
   * Decrements (remove 1 from the number) the stored value.
   * @param {*} keyOrPath  Either a key, or full path, to the value you want to decrement. The value must be a number.
   * @return {Promise<Josh>} This database wrapper, useful if you want to chain more instructions for Josh.
   */
  async dec(keyOrPath) {
    await this.readyCheck();
    const [key, ...path] = keyOrPath.split('.');
    await this.provider.dec(key, path);
    return this;
  }

}

module.exports = Josh;
