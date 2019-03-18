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
  it('should initialize with credentials', () => {
    const provider = new Mongo(config);
    const josh = new Josh({ name: 'joshtest', provider });
    console.log(josh);
    josh.defer.then(() => {
      console.log(`Josh Initialize With ${josh.size} entries.`);
    });
    expect(josh).toMatchSnapshot();
  });
});
