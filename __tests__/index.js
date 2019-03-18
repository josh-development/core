/* global describe expect it */
const Josh = require('./');

describe('Basic Initialization', () => {
  it('should fail without props', () => {
    expect(() => {
      const josh = new Josh();
      console.log(josh);
    }).toThrow();
  });
});
