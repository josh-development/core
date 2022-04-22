import { Josh } from '../../../src';

describe('Josh', () => {
  describe('is a class', () => {
    test('GIVEN typeof Josh THEN returns function', () => {
      expect(typeof Josh).toBe('function');
    });

    test('GIVEN typeof ...prototype THEN returns object', () => {
      expect(typeof Josh.prototype).toBe('object');
    });
  });

  describe('methods runs', () => {
    const josh = new Josh({ name: 'test:name' });

    test('resolvePath', () => {
      expect(josh['resolvePath']('test.path')).toEqual(['test', 'path']);
      expect(josh['resolvePath']('test.path.to.file')).toEqual(['test', 'path', 'to', 'file']);
      expect(josh['resolvePath']('test.path.to[0].index')).toEqual(['test', 'path', 'to', '0', 'index']);
      expect(josh['resolvePath']('test[0].path.to[1].index')).toEqual(['test', '0', 'path', 'to', '1', 'index']);
    });
  });
});
