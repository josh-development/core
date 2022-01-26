import { JoshProvider } from '../../../src';

describe('JoshProvider', () => {
  describe('is a class', () => {
    test('GIVEN typeof JoshProvider THEN returns function', () => {
      expect(typeof JoshProvider).toBe('function');
    });

    test('GIVEN typeof ...prototype THEN returns object', () => {
      expect(typeof JoshProvider.prototype).toBe('object');
    });
  });
});
