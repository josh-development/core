const {
  MongoClient,
} = require('mongodb');

const _ = require('lodash');

class JoshProvider {

  constructor(options) {
    if (!options.name) throw new Error('Must provide options.name');
    this.name = options.name;
    this.validateName();
    this.auth =
      options.user && options.password ?
        `${options.user}:${options.password}@` :
        '';
    this.dbName = options.dbName || 'test';
    this.port = options.port || 27017;
    this.host = options.host || 'localhost';
    this.url =
      options.url ||
      `mongodb://${this.auth}${this.host}:${this.port}/${this.dbName}`;
  }

  /**
   * Internal method called on persistent joshs to load data from the underlying database.
   * @param {Map} josh In order to set data to the josh, one must be provided.
   * @returns {Promise} Returns the defer promise to await the ready state.
   */
  async init() {
    console.log('Initializing MongoDB');
    this.client = await MongoClient.connect(this.url, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log(this.client);
    this.db = this.client.db(this.dbName).collection(this.name);
    console.log(this.db);
    return true;
  }

  get settings() {
    return {
      name: this.dbName,
    };
  }

  /**
   * Shuts down the underlying database.
   */
  close() {
    this.client.close();
  }

  /**
   * Set a value to the josh.
   * @param {(string|number)} key Required. The key of the element to add to the josh object.
   * @param {*} val Required. The value of the element to add to the josh object.
   * This value MUST be stringifiable as JSON.
   */
  set(key, val) {
    if (!key || !['String', 'Number'].includes(key.constructor.name)) {
      throw new Error('Keys should be strings or numbers.');
    }
    this.db.update({
      _id: key,
    }, {
      _id: key,
      value: val,
    }, {
      upsert: true,
    });
  }

  get(key) {
    console.log(`Retrieving ${key}'s data`);
    return this.db.findOne({
      _id: key,
    });
  }

  keyArray() {
    return new Promise((resolve, reject) => {
      this.db.find({}).toArray((err, docs) => {
        if (err) reject(err);
        resolve(docs);
      });
    });
  }

  delete(key) {
    return this.db.remove({
      _id: key,
    }, {
      single: true,
    });
  }

  deleteAll() {
    return this.db.deleteMany({});
  }

  hasAsync(key) {
    return this.db.find({
      _id: key,
    }).limit(1);
  }

  /**
   * Deletes all entries in the database.
   * @return {Promise<*>} Promise returned by the database after deletion
   */
  bulkDelete() {
    return this.db.drop();
  }

  /**
   * Internal method used to validate persistent josh names (valid Windows filenames)
   * @private
   */
  validateName() {
    // Do not delete this internal method.
    this.name = this.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  keyCheck(key) {
    return !_.isNil(key) && key[0] !== '$';
  }

}

module.exports = JoshProvider;
