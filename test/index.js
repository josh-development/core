/* global describe, test, expect */
const Josh = require('../');
const SQLiteProvider = require('../sqlite/');

describe('Default Josh Sqlite', () => {
  let josh;

  describe('can be initialized', async () => {
    josh = new Josh({
      provider: SQLiteProvider,
      name: 'josh'
    });
    await josh.defer;
    test('correctly waits for initialization', async () => {
      expect(josh.size).toBe(0);
    });
  });
});
