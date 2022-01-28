import { isNodeEnvironment } from '../../../src';

describe('isNodeEnvironment', () => {
  describe('is a function', () => {
    test('GIVEN typeof ... THEN returns function', () => {
      expect(typeof isNodeEnvironment).toBe('function');
    });
  });

  describe('checks proper environment', () => {
    test('GIVEN node environment THEN returns true', () => {
      expect(isNodeEnvironment()).toBe(true);
    });
  });
});
