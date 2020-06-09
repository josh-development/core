const sqlite = require('sqlite');

// Lodash should probably be a core lib but hey, it's useful!
const {
  get: _get,
  // set: _set,
  // has: _has,
  // delete: _delete,
  isNil,
  // isFunction,
  isArray,
  isObject,
  // toPath,
  // merge,
  // clone,
  // cloneDeep,
} = require('lodash');

// Native imports
const { resolve, sep } = require('path');
const fs = require('fs');

// Custom error codes with stack support.
const Err = require('../../error.js');

module.exports = class JoshProvider {

  constructor(options) {
    if (!options.name) throw new Error('Must provide options.name');

    // C'mon eslint, you should understand scopes.
    // eslint-disable-next-line
    this.defer = new Promise((resolve) => {
      this.ready = resolve;
    });

    this.dataDir = resolve(process.cwd(), options.dataDir || 'data');

    if (!options.dataDir) {
      if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data');
      }
    }

    this.name = options.name;
    this.validateName();
    this.dbName = options.dbName || 'defaultenmap';
  }

  /**
   * Internal method called on persistent Enmaps to load data from the underlying database.
   * @param {Map} enmap In order to set data to the Enmap, one must be provided.
   * @returns {Promise} Returns the defer promise to await the ready state.
   */
  async init() {
    this.db = await sqlite.open(`${this.dataDir}${sep}josh.sqlite`);
    const table = await this.db.get(`SELECT count(*) FROM sqlite_master WHERE type='table' AND name = '${this.name}';`);
    if (!table['count(*)']) {
      await this.db.run(`CREATE TABLE ${this.name} (key text PRIMARY KEY, value text)`);
      await this.db.run('PRAGMA synchronous = 1;');
      await this.db.run('PRAGMA journal_mode = wal;');
    }
    this.ready();
    return this.defer;
  }

  /**
   * Force fetch one or more key values from the database. If the database has changed, that new value is used.
   * @param {string|number} key A single key or array of keys to force fetch from the database.
   * @param {string} path The path to a value within an object or array value.
   * @return {Enmap|*} The Enmap, including the new fetched values, or the value in case the function argument is a single key.
   */
  get(key, path) {
    return this.db.prepare(`SELECT * FROM ${this.name} WHERE key = ?;`)
      .then(stmt => stmt.get(key))
      .then(res => {
        const data = res && this.parseData(res.value);
        if (!data) return null;
        if (path) return _get(data, path);
        return data;
      });
  }

  getMany(keys) {
    return this.db.prepare(`SELECT * FROM ${this.name} WHERE key IN (${'?, '.repeat(keys.length).slice(0, -2)})`)
      .then(stmt => stmt.all(keys))
      .then(res => res.map(row => [row.key, JSON.parse(row.value)]));
  }

  async has(key) {
    const data = await (await this.db.prepare(`SELECT count(*) FROM '${this.name}' WHERE key = ?;`)).get(key);
    console.log(`${data['count(*)']} for ${key}`);
    return data['count(*)'] === 1;
  }

  /**
   * Set a value to the Enmap.
   * @param {(string|number)} key Required. The key of the element to add to the EnMap object.
   * If the EnMap is persistent this value MUST be a string or number.
   * @param {*} val Required. The value of the element to add to the EnMap object.
   * If the EnMap is persistent this value MUST be stringifiable as JSON.
   */
  async set(key, val) {
    if (!key || !['String', 'Number'].includes(key.constructor.name)) {
      throw new Error('SQLite require keys to be strings or numbers.');
    }
    await this.db.run(`INSERT OR REPLACE INTO ${this.name} (key, value) VALUES (?, ?);`, [key.toString(), JSON.stringify(val)]);
    return this;
  }

  /**
   * Delete an entry from the Enmap.
   * @param {(string|number)} key Required. The key of the element to delete from the EnMap object.
   * @param {boolean} bulk Internal property used by the purge method.
   */
  async delete(key) {
    await this.db.run(`DELETE FROM ${this.name} WHERE key = ?`, [key]);
  }

  /**
   * Retrieves the number of rows in the database for this enmap, even if they aren't fetched.
   * @return {integer} The number of rows in the database.
   */
  async count() {
    const data = await (await this.db.prepare(`SELECT count(*) FROM '${this.name}';`)).get();
    return data['count(*)'];
  }

  async random(count = 1) {
    const data = await (await this.db.prepare(`SELECT * FROM '${this.name}' WHERE rowid IN(SELECT rowid FROM '${this.name}' ORDER BY RANDOM() LIMIT ${count});`)).all();
    return count > 1 ? data : data[0];
  }

  async randomKey(count = 1) {
    const data = await (await this.db.prepare(`SELECT key FROM '${this.name}' WHERE rowid IN(SELECT rowid FROM '${this.name}' ORDER BY RANDOM() LIMIT ${count});`)).all();
    return count > 1 ? data.map(row => row.key) : data[0].key;
  }

  /**
   * Retrieves all the indexes (keys) in the database for this enmap, even if they aren't fetched.
   * @return {array<string>} Array of all indexes (keys) in the enmap, cached or not.
   */
  async keys() {
    const rows = await (await this.db.prepare(`SELECT key FROM '${this.name}';`)).all();
    return rows.map(row => row.key);
  }

  async values() {
    const rows = await (await this.db.prepare(`SELECT value FROM '${this.name}';`)).all();
    return rows.map(row => this.parseData(row.value));
  }

  async clear() {
    this.db.exec(`DELETE FROM ${this.name}`);
  }

  // ARRAY METHODS
  async push(key, value, allowDupes) {
    await this.check(key, 'Array');
    const data = await this.get(key);
    if (!allowDupes && data.indexOf(value) > -1) return;
    data.push(value);
    this.set(key, data);
  }

  async remove(key, value) {
    await this.check(key, ['Array', 'Object']);
    const data = await this.get(key);
    if (isArray(data)) {
      const index = data.indexOf(value);
      if (index > -1) {
        data.splice(index, 1);
      }
    } else if (isObject(data)) {
      delete data[value];
    }
    this.set(key, data);
  }

  async inc(key) {
    await this.check(key, ['Number']);
    this.set(key, await this.get(key) + 1);
  }

  async dec(key) {
    await this.check(key, ['Number']);
    this.set(key, await this.get(key) - 1);
  }

  /**
   * Shuts down the underlying persistent enmap database.
   */
  close() {
    this.db.close();
  }

  keyCheck(key) {
    if (isNil(key) || !['String', 'Number'].includes(key.constructor.name)) {
      throw new Error('josh-sqlite require keys to be strings or numbers.');
    }
  }

  /**
   * Internal method used to validate persistent enmap names (valid Windows filenames)
   * @private
   */
  validateName() {
    // Do not delete this internal method.
    this.name = this.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  parseData(data) {
    try {
      return JSON.parse(data);
    } catch (err) {
      console.log('Error parsing data : ', err);
      return null;
    }
  }

  /*
   * INTERNAL method to verify the type of a key or property
   * Will THROW AN ERROR on wrong type, to simplify code.
   * @param {string|number} key Required. The key of the element to check
   * @param {string} type Required. The javascript constructor to check
   * @param {string} path Optional. The dotProp path to the property in JOSH.
   */
  async check(key, type, path = null) {
    if (!await this.has(key)) throw new Err(`The key "${key}" does not exist in JOSH "${this.name}"`, 'JoshPathError');
    if (!type) return;
    if (!isArray(type)) type = [type];
    if (!isNil(path)) {
      await this.check(key, 'Object');
      const data = await this.get(key);
      if (isNil(_get(data, path))) {
        throw new Err(`The property "${path}" in key "${key}" does not exist. Please set() it or ensure() it."`, 'JoshPathError');
      }
      if (!type.includes(_get(data, path).constructor.name)) {
        throw new Err(`The property "${path}" in key "${key}" is not of type "${type.join('" or "')}" in JOSH "${this.name}" 
(key was of type "${_get(data, path).constructor.name}")`, 'JoshTypeError');
      }
    } else if (!type.includes((await this.get(key)).constructor.name)) {
      throw new Err(`The key "${key}" is not of type "${type.join('" or "')}" in JOSH "${this.name}" (key was of type "${this.get(key).constructor.name}")`, 'JoshTypeError');
    }
  }


};
