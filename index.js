const _ = require('lodash');

const mongo = require("./providers/josh-mongo");
const sqlite = require("./providers/josh-sqlite");

// Custom error codes with stack support.
const Err = require('./error.js');

// Package.json
const pkgdata = require('./package.json');

class Josh {

  constructor(options = {}) {
    const {
      provider: Provider,
      name
    } = options;
    
    this.version = pkgdata.version;

    if (!Provider || !name) {
      throw new Err("Josh requires both a Name and Provider input ", 'JoshOptionsError');
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
  readyCheck () {
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

  async setIn(key, path, value) {
    this.readyCheck();
    return true;
  }
  
  get keys() {
    this.readyCheck();
    return this.provider.keys();
  }
  
  async delete(key = null) {
    if(key == "::all::") {
      this.provider.clear();
    } else {
      this.provider.delete(key);
    }
  }

}

module.exports = Josh;
module.exports.providers = {
  mongo,
  sqlite,
};
