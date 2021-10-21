const {
  merge,
  isArray,
  isFunction,
  get: _get,
  isNil,
  isObject,
  cloneDeep,
} = require('lodash');
const serialize = require('serialize-javascript');

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
   * const Josh = require("@joshdb/core");
   * const provider = require("@joshdb/sqlite");
   *
   * // sqlite-based database, with default options
   * const sqliteDB = new Josh({
   *   name: 'mydatabase',
   *   provider,
   * });
   */
  constructor(options = {}) {
    const { provider: Provider, name, providerOptions } = options;

    // Just grab the version from package.json
    this.version = pkgdata.version;

    // Fail miserably and weep if no provider, or no name, was given during initialization
    if (!Provider || !name) {
      throw new Err(
        'Josh requires both a "name" and "provider" given in the options.',
        'JoshOptionsError',
      );
    }

    // Verify if the provider given is an object, and is a valid provider for Josh...
    const intializedProvider = new Provider({ name, ...providerOptions });
    if (intializedProvider.constructor.name !== 'JoshProvider') {
      throw new Err(
        `The given Provider does not seem valid. I expected JoshProvider, but this was a ${intializedProvider.constructor.name}!`,
        'JoshOptionsError',
      );
    }

    // Create a function that will be resolved whenever the provider's database is connected.
    this.defer = new Promise((resolve) => {
      this.ready = resolve;
    });

    // Configure shit
    this.provider = intializedProvider;
    this.name = name;

    this.all = Symbol('_all');
    this.off = Symbol('_off');

    this.serializer = options.serializer;
    this.deserializer = options.deserializer;

    this.autoEnsure = isNil(options.autoEnsure) ? this.off : options.autoEnsure;
    this.ensureProps = isNil(options.ensureProps) ? true : options.ensureProps;

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
    if (this.isDestroyed) {
      throw new Err(
        'This Josh has been destroyed and can no longer be used without being re-initialized.',
        'JoshDestroyedError',
      );
    }
  }

  /*
   * Internal Method. Splits the key and path
   */
  getKeyAndPath(keyOrPath) {
    if (!keyOrPath) return [];
    const [key, ...path] = keyOrPath.split('.');
    return [key.toString(), path.length ? path.join('.') : null];
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
    const [key, path] = this.getKeyAndPath(keyOrPath);
    if(isNil(key)) return null;
    let value;
    if (!(await this.has(keyOrPath))) {
      if (this.autoEnsure !== this.off) value = this.autoEnsure;
      else return null;
    } else {
      value = await this.provider.get(key);
    }
    value = this.deserializer ? await this.deserializer(value, key, path) : value;
    return !isNil(path) ? _get(value, path) : value;
  }

  // Not yet implemented (or implementable)
  // async query(opts) {
  //   await this.readyCheck();
  //   this.provider.query(opts);
  // }

  /**
   * Retrieve many values from the database.
   * If you provide `josh.all` as a value (josh being your variable for the database), the entire data set is returned.
   * @param {string[]|symbol} keys An array of keys to return, or `db.all` to retrieve them all.
   * @return {Promise<Object>} An object with one or many key/value pairs where the property name is the key and the property value is the database value.
   */
  async getMany(keys) {
    await this.readyCheck();
    const data =
      keys === this.all ? this.provider.getAll() : this.provider.getMany(keys);
    if (this.deserializer) {
      for(const key of Object.keys(data)) {
        data[key] = await this.deserializer(data[key], key);
      }
    }
    return data;
  }

  /**
   * Returns one or more random values from the database.
   * @param {number} count Defaults to 1. The number of random key/value pairs to get.
   * @return {Promise<Object>} An array of key/value pairs each in their own array.
   * The array of values should never contain duplicates. If the requested count is higher than the number
   * of rows in the database, only the available number of rows will be returned, in randomized order.
   * Each array element is comprised of the key and value: // TODO : FIX [['a', 1], ['b', 2], ['c', 3]]
   */
  async random(count) {
    await this.readyCheck();
    return await this.provider.random(count);
  }

  /**
   * Returns one or more random keys from the database.
   * @param {number} count Defaults to 1. The number of random key/value pairs to get.
   * @return {Promise<Array.<string>>} An array of string keys in a randomized order.
   * The array of keys should never contain duplicates. If the requested count is higher than the number
   * of rows in the database, only the available number of rows will be returned.
   */
  async randomKey(count) {
    await this.readyCheck();
    return await this.provider.randomKey(count);
  }

  /**
   * Verifies whether a key, or a specific property of an object, exists at all.
   * @param {string} keyOrPath Either a key, or full path, of the value you want to get.
   * For more information on how path works, see https://josh.evie.dev/path
   * @return {Promise<boolean>} Whether the key, or property specified in the path, exists.
   */
  async has(keyOrPath) {
    await this.readyCheck();
    try {
      const [key, path] = this.getKeyAndPath(keyOrPath);
      return this.provider.has(key, path);
    } catch (err) {
      console.log(keyOrPath);
      console.log(`Error on ${keyOrPath}: ${err}`);
      return null;
    }
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
   * @return {Promise<number>} An integer equal to the amount of stored key/value pairs.
   */
  get size() {
    return this.readyCheck().then(() => this.provider.count());
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
    const [key, path] = this.getKeyAndPath(keyOrPath);
    if(isNil(value) && this.autoEnsure !== this.off) {
      value = this.autoEnsure;
    }
    await this.provider.set(
      key,
      path,
      this.serializer ? await this.serializer(value, key, path) : value,
    );
    return this;
  }

  /**
   * Store many values at once in the database. DOES NOT SUPPORT PATHS. Or autoId.
   * @param {Object} data The data to insert. Must be an object as key/value pairs.
   * @param {boolean} overwrite Whether to overwrite existing keys. Since this method does not support paths, existin data will be lost.
   * @return {Promise<Josh>} This database wrapper, useful if you want to chain more instructions for Josh.
   * @example
   * josh.setMany({
   *   "thinga": "majig",
   *   "foo": "bar",
   *   "isCool": true
   * });
   */
  async setMany(data, overwrite) {
    await this.readyCheck();
    await this.provider.setMany(data, overwrite);
    return this;
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
   * josh.update('thing', {
   *   a: 'one',
   *   d: 4
   * });
   * // value is now {a: 'one', b: 2, c: 3, d: 4}
   *
   * josh.update('thing', (previousValue) => {
   *   ...previousValue,
   *   b: 'two',
   *   e: 5,
   * });
   * // value is now {a: 'one', b: 'two', c: 3, d: 4, e: 5}
   */
  async update(keyOrPath, input) {
    await this.readyCheck();
    const previousValue = await this.get(keyOrPath);
    let mergeValue = input;
    if (typeof input === 'function') {
      mergeValue = input(previousValue);
    }
    await this.set(keyOrPath, merge(previousValue, mergeValue));
    return this;
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
    const [key, path] = this.getKeyAndPath(keyOrPath);
    defaultValue = cloneDeep(defaultValue);
    if (this.autoEnsure !== this.off) {
      if (!isNil(defaultValue)) {
        console.warn(
          `WARNING: Saving "${key}" autoEnsure value was provided for this JOSH but a default value has also been provided. The defaultValue will be used, autoEnsure value is used instead.`,
        );
      }
      defaultValue = this.autoEnsure;
    }

    if (isNil(defaultValue)) {
      throw new Err(
        `No defaultValue or autoEnsure value provided on ensure method for "${key}" in "${this.name}"`,
        'JOSHArgumentError',
      );
    }
    if(!isNil(path)) {
      if (this.ensureProps) await this.ensure(key, {});
      if(await this.has(keyOrPath)) return await this.get(keyOrPath);
      await this.set(keyOrPath, defaultValue);
      return defaultValue;
    }
    let currValue = await this.get(key);
    if(this.ensureProps && isObject(currValue)) {
      
      const merged = merge(defaultValue, currValue);
      await this.set(key, merged);
      return merged;
    }
    if(await this.has(keyOrPath)) return await this.get(keyOrPath);
    this.set(keyOrPath, defaultValue);
    return defaultValue;
  }

  /**
   * Remove a key/value pair, or the property and value at a specific path, or clear the database.
   * @param {string|symbol|Array<string>} keyOrPath Either a key, or full path, of the value you want to delete.
   * If providing a path, only the value located at the path is deleted.
   * If providing an array, will delete all keys in that array (does not support paths)
   * Alternatively: josh.delete(josh.all) will clear the database of all data.
   * @return {Promise<Josh>} This database wrapper, useful if you want to chain more instructions for Josh.
   */
  async delete(keyOrPath) {
    await this.readyCheck();
    if (isArray(keyOrPath)) {
      return this.provider.deleteMany(keyOrPath);
    }
    if (keyOrPath === this.all) {
      await this.provider.clear();
    } else {
      const [key, path] = this.getKeyAndPath(keyOrPath);
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
    const [key, path] = this.getKeyAndPath(keyOrPath);
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
    const [key, path] = isArray(keyOrPath) ? 
      [key, null] :
      this.getKeyAndPath(keyOrPath);
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
    const [key, path] = this.getKeyAndPath(keyOrPath);
    await this.provider.inc(key, path);
    return this;
  }

  /**
   * Decrements (remove 1 from the number) the stored value.
   * @param {*} keyOrPath Either a key, or full path, to the value you want to decrement. The value must be a number.
   * @return {Promise<Josh>} This database wrapper, useful if you want to chain more instructions for Josh.
   */
  async dec(keyOrPath) {
    await this.readyCheck();
    const [key, path] = this.getKeyAndPath(keyOrPath);
    await this.provider.dec(key, path);
    return this;
  }

  /**
   * Finds a value within the database, either through an exact value match, or a function.
   * Useful for Objects and Array values, will not work on "simple" values like strings.
   * Returns the first found match - if you need more than one result, use filter() instead.
   * Either a function OR a value **must** be provided.
   * Note that using functions here currently is very inefficient, so it's suggested to use paths whenever necesary.
   * @param {Function|string} pathOrFn Mandatory. Either a function, or the path in which to find the value.
   * If using a function: it will run on either the stored value, OR the value at the path given if it's provided.
   * - The function receives the value (or value at the path) as well the the key currently being checked.
   * - The function must return a boolean or truthy/falsey value! Oh and the function can be async, too ;)
   * If using a path:
   * - A "value" predicate is mandatory when checking by path.
   * - The value must be simple: string, boolean, integer. It cannot be an object or array.
   * @param {string} predicate Optional on functions, Mandatory on path finds. If provided, the function or value acts on what's at that path.
   * @return {Promise<Object>} Returns an array composed of the full value (NOT the one at the path!), and the key.
   * @example
   * // Assuming:
   * josh.set("john.shmidt", {
   *   fullName: "John Jacob Jingleheimer Schmidt",
   *   id: 12345,
   *   user: {
   *     username: "john.shmidt",
   *     firstName: "john",
   *     lastName: "shmidt",
   *     password: "somerandombcryptstringthingy",
   *     lastAccess: -22063545000,
   *     isActive: false,
   *     avatar: null,
   *   }
   * });
   *
   * // Regular string find:
   * josh.find("user.firstName", "john")
   *
   * // Simple function find:
   * josh.find(value => value.user.firstName === "john");
   *
   * // Function find with a path:
   * josh.find(value => value === "john", "user.firstName");
   *
   * // The return of all the above if the same:
   * {
   *   "john.shmidt": {
   *     fullName: "John Jacob Jingleheimer Schmidt",
   *     id: 12345,
   *     user: {
   *       username: "john.shmidt",
   *       firstName: "john",
   *       lastName: "shmidt",
   *       password: "somerandombcryptstringthingy",
   *       lastAccess: -22063545000,
   *       isActive: false,
   *       avatar: null,
   *     }
   *   }
   * }
   */
  async find(pathOrFn, predicate) {
    await this.readyCheck();
    return isFunction(pathOrFn)
      ? this.provider.findByFunction(pathOrFn, predicate)
      : this.provider.findByValue(pathOrFn, predicate);
  }

  /**
   * Filters for values within the database, either through an exact value match, or a function.
   * Useful for Objects and Array values, will not work on "simple" values like strings.
   * Returns all matches found - if you need a single value, use find() instead.
   * Either a function OR a value **must** be provided.
   * Note that using functions here currently is very inefficient, so it's suggested to use paths whenever necesary.
   * @param {Function|string} pathOrFn Mandatory. Either a function, or the path in which to find the value.
   * If using a function: it will run on either the stored value, OR the value at the path given if it's provided.
   * - The function receives the value (or value at the path) as well the the key currently being checked.
   * - The function must return a boolean or truthy/falsey value! Oh and the function can be async, too ;)
   * If using a path:
   * - A "value" predicate is mandatory when checking by path.
   * - The value must be simple: string, boolean, integer. It cannot be an object or array.
   * @param {string} predicate Optional on functions, Mandatory on path finds. If provided, the function or value acts on what's at that path.
   * @return {Promise<Object>} Returns an array of key/value pair(s) that successfully passes the provided function.
   *
   */
  async filter(pathOrFn, predicate) {
    await this.readyCheck();
    return isFunction(pathOrFn)
      ? this.provider.filterByFunction(pathOrFn, predicate)
      : this.provider.filterByValue(pathOrFn, predicate);
  }

  /**
   * Maps data from each value in your data. Works similarly to Array.map(), but can use both async functions, as well as paths.
   * Note that using functions here currently is very inefficient, so it's suggested to use paths whenever necesary.
   * @param {Function|string} pathOrFn Mandatory. Either a function, or the path where to get the value from.
   * If using a path, the value at the path will be returned, or null.
   * If using a function, the function is run on the entire value (no path is used). The function is given the `key` and `value` as arguments,
   * and the value returned will be accessible in the return array.
   * @return {Promise<Array<*>>} An array of values mapped from the data.
   */
  async map(pathOrFn) {
    await this.readyCheck();
    return isFunction(pathOrFn)
      ? this.provider.mapByFunction(pathOrFn)
      : this.provider.mapByValue(pathOrFn);
  }

  /**
   * Performs Array.includes() on a certain value. Works similarly to
   * [Array.includes()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes).
   * @param {string} keyOrPath Either a key, or full path, to the array you want to check for the value. The value must be an array.
   * @param {*} value Either the value to check in the array, or a function to determine the presence of the value.
   * If using a value, note that this won't work if the value you're checking for is an array or object - use a function for that.
   * If using a function, the function takes in the value and index, and must return a boolean true when the value is the one you want.
   * @return {Promise<boolean>} Whether the value is included in the array.
   * @example
   * josh.set('arr', ['a', 'b', 1, 2, { foo: "bar"}]);
   *
   * josh.includes('arr', 'a'); // true
   * josh.includes('arr', 1) // true
   * josh.includes('arr', val => val.foo === 'bar'); // true
   */
  async includes(keyOrPath, value) {
    await this.readyCheck();
    const [key, path] = this.getKeyAndPath(keyOrPath);
    return this.provider.includes(key, path, value);
  }

  /**
   * Checks whether *at least one key* contains the expected value. The loop stops once the value is found.
   * @param {string} pathOrFn Either a function, or the full path to the value to check against the provided value.
   * If using a path, the value at he path will be compared to the value provided as a second argument.
   * If using a function, the function is given the *full* value for each key, along with the key itself, for each row in the database.
   * It should return `true` if your match is found.
   * @param {string|number|boolean|null} value The value to be checked at each path. Cannot be an object or array (use a function for those).
   * Ignored if a function is provided.
   * @return {Promise<boolean>} Whether the value was found or not (if one of the rows in the database match the value at path, or the function has returned true)
   */
  async some(pathOrFn, value) {
    await this.readyCheck();
    return isFunction(pathOrFn)
      ? this.provider.someByFunction(pathOrFn)
      : this.provider.someByValue(pathOrFn, value);
  }

  /**
   * Checks whether *every single key* contains the expected value. Identical to josh.some() except all must match except just one.
   * @param {*} pathOrFn  Either a function, or the full path to the value to check against the provided value.
   * If using a path, the value at he path will be compared to the value provided as a second argument.
   * If using a function, the function is given the *full* value for each key, along with the key itself, for each row in the database.
   * It should return `true` if your match is found.
   * @param {Promise<string|number|boolean|null>} value The value to be checked at each path. Cannot be an object or array (use a function for those).
   * @return {boolean} Whether the value was found or not, on ever single row.
   */
  async every(pathOrFn, value) {
    await this.readyCheck();
    return isFunction(pathOrFn)
      ? this.provider.everyByFunction(pathOrFn)
      : this.provider.everyByValue(pathOrFn, value);
  }

  // async reduce(fn, initialvalue)

  /**
   * Executes a mathematical operation on a value and saves the result in the database.
   * @param {string} keyOrPath Either a key, or full path, to the numerical value you want to exceute math on. Must be an Number value.
   * @param {string} operation Which mathematical operation to execute. Supports most
   * math ops: =, -, *, /, %, ^, and english spelling of those operations.
   * @param {number} operand The right operand of the operation.
   * @param {string} path Optional. The property path to execute the operation on, if the value is an object or array.
   * @return {Promise<Josh>} This database wrapper, useful if you want to chain more instructions for Josh.
   * @example
   * // Assuming
   * josh.set("number", 42);
   * josh.set("numberInObject", {sub: { anInt: 5 }});
   *
   * josh.math("number", "/", 2); // 21
   * josh.math("number", "add", 5); // 26
   * josh.math("number", "modulo", 3); // 2
   * josh.math("numberInObject.sub.anInt", "+", 10); // 15
   *
   */
  async math(keyOrPath, operation, operand) {
    await this.readyCheck();
    const [key, path] = this.getKeyAndPath(keyOrPath);
    await this.provider.math(key, path, operation, operand);
    return this;
  }

  /**
   * Get an automatic ID for insertion of a new record.
   * @return {Promise<string>} A unique ID to insert data.
   * @example
   * const Josh = require("@joshdb/core");
   * const provider = require("@joshdb/sqlite");
   *
   *
   * const sqliteDB = new Josh({
   *   name: 'mydatabase',
   *   provider,
   * });
   * (async() => {
   *   const newId = await sqliteDB.autoId();
   *   console.log("Inserting new row with ID: ", newID);
   *   sqliteDB.set(newId, "This is a new test value");
   * })();
   */
  async autoId() {
    await this.readyCheck();
    return await this.provider.autoId();
  }

  /**
   * Import an existing json export from josh or enmap. This data must have been exported from josh or enmap,
   * and must be from a version that's equivalent or lower than where you're importing it.
   * @param {string} data The data to import to Josh. Must contain all the required fields provided by export()
   * @param {boolean} overwrite Defaults to `true`. Whether to overwrite existing key/value data with incoming imported data
   * @param {boolean} clear Defaults to `false`. Whether to clear the enmap of all data before importing
   * (**__WARNING__**: Any exiting data will be lost! This cannot be undone.)
   * @return {Promise<Josh>} This database wrapper, useful if you want to chain more instructions for Josh.
   */
  async import(data, overwrite = true, clear = false) {
    await this.readyCheck();
    if (clear) await this.delete(this.all);
    if (isNil(data)) {
      throw new Err(
        `No data provided for import() in "${this.name}"`,
        'JoshImportError',
      );
    }
    const parsed = eval(`(${data})`);
    const importData = {};
    for (const { key, value } of parsed.keys) {
      importData[key] = this.serializer
        ? await this.serializer(value, key)
        : value;
    }
    await this.provider.setMany(importData, overwrite);
    return this;
  }

  /**
   * Exports your entire database in JSON format. Useable as import data for both Josh and Enmap.
   * ***WARNING: This currently requires loading the entire database in memory to write to JSON and might fail on large datasets (more than 1Gb)***
   * @return {Promise<string>} A JSON string that can be saved wherever you need it.
   * @example
   * const fs = require("fs");
   * josh.export().then(data => fs.writeFileSync("./export.json"), data));
   */
  async export() {
    await this.readyCheck();
    const data = await this.provider.getAll();
    const output = {
      name: this.name,
      version: pkgdata.version,
      exportDate: Date.now(),
      keys: [],
    };
    for (const key of Object.keys(data)) {
      const keydata = this.deserializer
        ? await this.deserializer(data[key], key)
        : data[key];
      output.keys.push({ key, value: keydata });
    }
    // serialize-javascript's serializer!
    return serialize(
      output,
      null,
      2,
    );
  }

  /**
   * Initialize multiple Josh instances easily. Used to simplify the creation of many tables
   * @param {Array<string>} names Array of strings. Each array entry will create a separate josh with that name.
   * @param {Object} options Options object to pass to each josh, excluding the name..
   * @example
   * // Using local variables.
   * const Josh = require('josh');
   * const provider = require("@joshdb/sqlite");
   * const { settings, tags, blacklist } = Josh.multi(['settings', 'tags', 'blacklist'], { provider });
   *
   * // Attaching to an existing object (for instance some API's client)
   * const Josh = require("@joshdb/core");
   * const provider = require("@joshdb/sqlite");
   * Object.assign(client, Josh.multi(["settings", "tags", "blacklist"], { provider }));
   *
   * @returns {Array<Map>} An array of initialized Josh instances.
   */
  static multi(names, options = {}) {
    if (!names.length || names.length < 1) {
      throw new Err(
        '"names" argument must be an array of string names.',
        'JoshTypeError',
      );
    }

    const returnvalue = {};
    for (const name of names) {
      const josh = new Josh({ name, ...options });
      returnvalue[name] = josh;
    }
    return returnvalue;
  }
}

module.exports = Josh;
