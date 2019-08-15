/* global describe expect it */
const Josh = require('../');
const Mongo = require('../providers/mongo/');
const config = require('./config-mongo.json');
/* config-mongo.json example contents
{
  "name": "josh-jest",
  "dbName": "testing",
  "user": "josh",
  "pass": "abcd1234",
  "host": "mydbidentifier.mlab.com",
  "port": 23456
}
*/

describe('MongoDB Initialization', () => {
  it('should initialize with credentials', async () => {
    const provider = new Mongo(config);
    const josh = new Josh({ name: 'joshtest', provider });
    await josh.defer;
    await josh.deleteAll();
    expect(josh).toMatchSnapshot();
  });

  it('should retrieve a list of keys', async () => {
    const provider = new Mongo(config);
    const josh = new Josh({ name: 'joshtest', provider });
    await josh.defer;
    console.log(`Josh Initialize With ${josh.size} entries.`);
    expect(josh).toMatchSnapshot();
  });
});

