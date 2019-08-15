const _ = require('lodash');

// Custom error codes with stack support.
const Err = require('./error.js');

// Package.json
const pkgdata = require('./package.json');

// Symbols are used to create "private" methods.
// https://medium.com/front-end-hacking/private-methods-in-es6-and-writing-your-own-db-b2e30866521f
const _defineSetting = Symbol('_defineSetting');
const _init = Symbol('init');
const _readyCheck = Symbol('readyCheck');

class Josh {

  constructor(options = {}) {
    const {
      provider: Provider,
      name
    } = options;
    console.log(options);

    let cloneLevel;
    if (options.cloneLevel) {
      const accepted = ['none', 'shallow', 'deep'];
      if (!accepted.includes(options.cloneLevel)) throw new Err('Unknown Clone Level. Options are none, shallow, deep. Default is deep.', 'JoshOptionsError');
      cloneLevel = options.cloneLevel; // eslint-disable-line prefer-destructuring
    } else {
      cloneLevel = 'deep';
    }

    this[_defineSetting]('cloneLevel', 'String', true, cloneLevel);
    this[_defineSetting]('version', 'String', false, pkgdata.version);

    if (!Provider || !name) {
      throw new Err("If you provide a name but no provider, I'm a bit confused as to what you're expecting to happen...", 'JoshOptionsError');
    }
    if (options.provider.constructor.name != 'JoshProvider') {
      throw new Err(`Sorry boss, that doesn't seem to be a valid Provider in your options, there. This was just a ${options.provider.constructor.name}!`, 'JoshOptionsError');
    }

    this[_defineSetting]('provider', 'JoshProvider', false, options.provider);
    this[_defineSetting]('name', 'String', false, name);
    this[_defineSetting]('persistent', 'Boolean', false, true);
    this[_defineSetting]('defer', 'Promise', false, this.provider.init(this));
    // Initialize this property, to prepare for a possible destroy() call.
    // This is completely ignored in all situations except destroying Josh.
    this[_defineSetting]('isDestroyed', 'Boolean', true, false);
  }

  /*
   * Internal Method. Defines a property with either user-provided value, or the default value.
   */
  [_defineSetting](name, type, writable, defaultValue, value) {
    if (_.isNil(value)) value = defaultValue;
    if (value.constructor.name !== type) {
      throw new Err(`Wrong value type provided for options.${name}:  Provided "${defaultValue.constructor.name}", expecting "${type}", in Josh "${this.name}".`);
    }
    Object.defineProperty(this, name, {
      value: !_.isNil(value) ? value : defaultValue,
      writable,
      enumerable: false,
      configurable: false
    });
  }

  /*
   * Internal Method. Verifies that the database is ready, assuming persistence is used.
   */
  [_readyCheck]() {
    if (!this.isReady) throw new Err('Database is not ready. Refer to the documentation to use josh.defer', 'JoshReadyError');
    if (this.isDestroyed) throw new Err('This Josh has been destroyed and can no longer be used without being re-initialized.', 'JoshDestroyedError');
  }

  async set(key, value) {
    this[_readyCheck]();
    key = this.provider.keyCheck(key);
    return key;
  }

  async get(key) {
    this[_readyCheck]();
    key = this.provider.keyCheck(key);
  }

  async setIn(key, path, value) {
    return true;
  }

  [_init]() {
    this.ready();
    return this.defer;
  }

}

module.exports = Josh;
