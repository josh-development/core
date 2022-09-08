import { AutoEnsureMiddleware } from '@joshdb/auto-ensure';
import { MapProvider } from '@joshdb/map';
import { ApplyMiddlewareOptions, CommonIdentifiers, JoshMiddleware, JoshProvider, MathOperator, Method, Payload, Trigger } from '@joshdb/provider';
import type { NonNullObject } from '@sapphire/utilities';
import { Bulk, Josh, JoshError } from '../../../src';

@ApplyMiddlewareOptions({ name: 'test' })
class TestMiddleware<StoredValue = unknown> extends JoshMiddleware<NonNullObject, StoredValue> {
  public run<P extends Payload>(payload: P): P {
    if (payload.trigger === Trigger.PostProvider) {
      if (TestMiddleware.errorCount === 1) {
        payload.errors.push(this.error(CommonIdentifiers.MissingValue));

        TestMiddleware.errorCount = 0;

        return payload;
      }

      if (TestMiddleware.errorCount === 2) {
        payload.errors.push(this.error(CommonIdentifiers.MissingValue));
        payload.errors.push(this.error(CommonIdentifiers.InvalidCount));

        TestMiddleware.errorCount = 0;

        return payload;
      }

      if (TestMiddleware.deleteData) {
        Reflect.deleteProperty(payload, 'data');

        TestMiddleware.deleteData = false;
      }
    }

    return payload;
  }

  public static errorCount: 0 | 1 | 2 = 0;

  public static deleteData = false;
}

describe('Josh', () => {
  describe('is a class', () => {
    test('GIVEN typeof Josh THEN returns function', () => {
      expect(typeof Josh).toBe('function');
    });

    test('GIVEN typeof ...prototype THEN returns object', () => {
      expect(typeof Josh.prototype).toBe('object');
    });
  });

  describe('can be instantiated class', () => {
    test('GIVEN class Josh THEN returns Josh', () => {
      const josh = new Josh({ name: 'name' });

      expect(josh).toBeInstanceOf(Josh);
    });

    test('GIVEN class Josh w/o name THEN throws error', () => {
      expect(() => new Josh({})).toThrowError('The "name" option is required to initiate a Josh instance');
    });

    test('GIVEN class Josh w/ autoEnsure THEN returns middleware size 1', () => {
      const josh = new Josh({ name: 'name', autoEnsure: { defaultValue: { foo: 'bar' } } });

      expect(josh.middlewares.size).toBe(1);
    });

    test('GIVEN class Josh w/ empty middlewares THEN returns instance', () => {
      const josh = new Josh({ name: 'name', middlewares: [] });

      expect(josh.middlewares.size).toBe(0);
    });

    test('GIVEN class Josh w/ middlewares THEN returns instance', () => {
      const josh = new Josh<{ test: boolean }>({
        name: 'name',
        middlewares: [new AutoEnsureMiddleware<{ test: boolean }>({ defaultValue: { test: false } })]
      });

      expect(josh.middlewares.size).toBe(1);
    });

    test('GIVEN provider with invalid instance THEN emits warning', () => {
      const spy = jest.spyOn(process, 'emitWarning').mockImplementation();
      // @ts-expect-error - this is a test
      const josh = new Josh({ name: 'name', provider: new Map() });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(process.emitWarning).toHaveBeenCalledWith(
        expect.stringContaining('The "provider" option must extend the exported "JoshProvider" class to ensure compatibility, but continuing anyway.')
      );

      spy.mockClear();
    });

    test('GIVEN provider with invalid instance THEN emits warning', () => {
      jest.spyOn(process, 'emitWarning').mockImplementation();

      // @ts-expect-error - this is a test
      const josh = new Josh({ name: 'name', middlewares: [new Map()] });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(process.emitWarning).toHaveBeenCalledWith(expect.stringContaining('The middleware must extend the exported "Middleware" class.'));
    });

    test('GIVEN Josh w/ init error THEN throws error', async () => {
      class TestProvider extends MapProvider {
        public async init(context: JoshProvider.Context): Promise<JoshProvider.Context> {
          context.error = this.error(CommonIdentifiers.MissingValue);

          return Promise.resolve(context);
        }
      }

      const josh = new Josh({ name: 'name', provider: new TestProvider() });

      await expect(josh.init()).rejects.toThrowError(josh.provider['error'](CommonIdentifiers.MissingValue));
    });
  });

  describe('middleware', () => {
    describe('use', () => {
      test('GIVEN josh THEN add middleware', () => {
        const josh = new Josh({ name: 'name' });

        expect(josh.middlewares.size).toBe(0);

        josh.use(new AutoEnsureMiddleware({ defaultValue: { test: false } }) as unknown as JoshMiddleware<{ test: boolean }>);

        expect(josh.middlewares.size).toBe(1);
      });

      test('GIVEN josh w/ hook middleware THEN add middleware', () => {
        const josh = new Josh({ name: 'name' });

        expect(josh.middlewares.size).toBe(0);

        josh.use({ name: 'test' }, (payload) => payload);

        expect(josh.middlewares.get('test')?.conditions).toEqual({ pre: [], post: [] });

        expect(josh.middlewares.size).toBe(1);
      });

      test('GIVEN josh w/ hook middleware w/ trigger THEN add middleware', () => {
        const josh = new Josh({ name: 'name' });

        expect(josh.middlewares.size).toBe(0);

        josh.use({ name: 'test', trigger: Trigger.PreProvider, method: Method.Dec }, (payload) => payload);

        expect(josh.middlewares.size).toBe(1);
        expect(josh.middlewares.get('test')?.conditions.pre).toEqual(['dec']);
        expect(josh.middlewares.get('test')?.conditions.post).toEqual([]);
      });

      test('GIVEN josh w/ hook middleware w/ trigger THEN add middleware', () => {
        const josh = new Josh({ name: 'name' });

        expect(josh.middlewares.size).toBe(0);

        josh.use({ name: 'test', trigger: Trigger.PostProvider, method: Method.Dec }, (payload) => payload);

        expect(josh.middlewares.size).toBe(1);
        expect(josh.middlewares.get('test')?.conditions.post).toEqual(['dec']);
        expect(josh.middlewares.get('test')?.conditions.pre).toEqual([]);
      });

      test('GIVEN josh w/ invalid hook middleware THEN add middleware', () => {
        const josh = new Josh({ name: 'name' });

        expect(josh.middlewares.size).toBe(0);

        // @ts-expect-error this is a test
        expect(() => josh.use({ name: 'test' })).toThrowError('The "hook" parameter for middleware was not found.');

        expect(josh.middlewares.size).toBe(0);
      });
    });
  });

  describe('resolvePath', () => {
    const josh = new Josh({ name: 'name' });

    test('resolvePath', () => {
      expect(josh['resolvePath']('test.path')).toEqual(['test', 'path']);
      expect(josh['resolvePath']('test.path.to.file')).toEqual(['test', 'path', 'to', 'file']);
      expect(josh['resolvePath']('test.path.to[0].index')).toEqual(['test', 'path', 'to', '0', 'index']);
      expect(josh['resolvePath']('test[0].path.to[1].index')).toEqual(['test', '0', 'path', 'to', '1', 'index']);
    });
  });

  describe('can manipulate data', () => {
    const josh = new Josh({ name: 'test', behaviorOnPayloadError: Josh.ErrorBehavior.Throw, middlewares: [new TestMiddleware({})] });
    const errors = [josh.provider['error'](CommonIdentifiers.MissingValue), josh.provider['error'](CommonIdentifiers.InvalidCount)];
    const multipleError = josh['error']({ identifier: Josh.Identifiers.MultipleError, errors });

    beforeAll(async () => {
      await josh.init();
    });

    beforeEach(async () => {
      await josh.clear();
    });

    afterAll(async () => {
      await josh.clear();
    });

    describe(Method.AutoKey, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.autoKey()).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.autoKey()).rejects.toThrowError(multipleError);
      });

      test('GIVEN payload w/o data property THEN throws error', async () => {
        TestMiddleware.deleteData = true;

        await expect(josh.autoKey()).rejects.toThrowError(josh['providerDataFailedError']);
      });

      test('GIVEN ... THEN returns data w/ generated key as data AND increments autoKeyCount', async () => {
        const data = await josh.autoKey();

        expect(typeof data).toBe('string');
      });

      test('each value of autoKey should be unique', async () => {
        const arr = await Promise.all([...Array(10)].map(async () => josh.autoKey()));
        const isUnique = new Set(arr).size === arr.length;

        expect(isUnique).toBe(true);
      });
    });

    describe(Method.Clear, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.clear()).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.clear()).rejects.toThrowError(multipleError);
      });

      test('GIVEN josh w/o data THEN provider data cleared', async () => {
        const sizeBefore = await josh.size();

        expect(sizeBefore).toBe(0);

        const result = await josh.clear();

        expect(result).toBeInstanceOf(Josh);

        const sizeAfter = await josh.size();

        expect(sizeAfter).toBe(0);
      });

      test('GIVEN josh w/ data THEN provider data cleared', async () => {
        await josh.set('key', 'value');

        const sizeBefore = await josh.size();

        expect(sizeBefore).toBe(1);

        const result = await josh.clear();

        expect(result).toBeInstanceOf(Josh);

        const sizeAfter = await josh.size();

        expect(sizeAfter).toBe(0);
      });
    });

    describe(Method.Dec, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        await josh.set('key', 1);

        TestMiddleware.errorCount = 1;

        await expect(josh.dec('key')).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        await josh.set('key', 1);

        TestMiddleware.errorCount = 2;

        await expect(josh.dec('key')).rejects.toThrowError(multipleError);
      });

      test('GIVEN josh w/ number at key THEN decremented number at key', async () => {
        await josh.set('key', 1);

        const result = await josh.dec('key');

        expect(result).toBeInstanceOf(Josh);

        const value = await josh.get('key');

        expect(value).toBe(0);
      });

      test('GIVEN josh w/ number at path THEN decremented number at path', async () => {
        await josh.set('key', 1, ['path']);

        const result = await josh.dec('key', ['path']);

        expect(result).toBeInstanceOf(Josh);

        const value = await josh.get('key', ['path']);

        expect(value).toBe(0);
      });
    });

    describe(Method.Delete, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.delete('key')).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.delete('key')).rejects.toThrowError(multipleError);
      });

      test('GIVEN josh w/ value at key THEN deletes value at key', async () => {
        await josh.set('key', 'value');

        const hasBefore = await josh.has('key');

        expect(hasBefore).toBe(true);

        const result = await josh.delete('key');

        expect(result).toBeInstanceOf(Josh);

        const hasAfter = await josh.has('key');

        expect(hasAfter).toBe(false);
      });

      test('GIVEN josh w/ value at path THEN deletes value at path', async () => {
        await josh.set('key', 'value');

        const hasBefore = await josh.has('key');

        expect(hasBefore).toBe(true);

        const result = await josh.delete('key', ['path']);

        expect(result).toBeInstanceOf(Josh);

        const hasAfter = await josh.has('key', ['path']);

        expect(hasAfter).toBe(false);
      });

      test('GIVEN josh w/ value at nested path THEN deletes value at nested path', async () => {
        await josh.set('key', 'value', ['path', 'nested']);

        const hasBefore = await josh.has('key', ['path', 'nested']);

        expect(hasBefore).toBe(true);

        const result = await josh.delete('key', ['path', 'nested']);

        expect(result).toBeInstanceOf(Josh);

        const hasAfter = await josh.has('key', ['path', 'nested']);

        expect(hasAfter).toBe(false);
      });
    });

    describe(Method.DeleteMany, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.deleteMany([])).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.deleteMany([])).rejects.toThrowError(multipleError);
      });

      test('GIVEN josh w/ value at key THEN deletes value at key', async () => {
        await josh.set('keymany', 'value');

        const hasBefore = await josh.has('keymany');

        expect(hasBefore).toBe(true);

        const result = await josh.deleteMany(['keymany']);

        expect(result).toBeInstanceOf(Josh);

        const hasAfter = await josh.has('keymany');

        expect(hasAfter).toBe(false);
      });

      test('GIVEN josh w/ multiple result at keys THEN deletes result at keys', async () => {
        await josh.set('keymany', 'value');
        await josh.set('keymany2', 'value');

        const hasBefore = (await josh.has('keymany')) && (await josh.has('keymany2'));

        expect(hasBefore).toBe(true);

        const result = await josh.deleteMany(['keymany', 'keymany2']);

        expect(result).toBeInstanceOf(Josh);

        const hasAfter = (await josh.has('keymany')) && (await josh.has('keymany2'));

        expect(hasAfter).toBe(false);
      });
    });

    describe(Method.Each, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.each((value) => value === 'value')).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.each((value) => value === 'value')).rejects.toThrowError(multipleError);
      });

      test('GIVEN josh w/o data THEN loops 0 times', async () => {
        const mockCallback = jest.fn(() => true);
        const result = await josh.each(mockCallback);

        expect(result).toBeInstanceOf(Josh);
        expect(mockCallback.mock.calls.length).toBe(0);
      });

      test('GIVEN josh w/ data THEN loops x times THEN clears', async () => {
        const mockCallback = jest.fn(() => true);

        await josh.set('key1', 'value1');
        await josh.set('key2', 'value2');
        await josh.set('key3', 'value3');

        const result = await josh.each(mockCallback);

        expect(result).toBeInstanceOf(Josh);
        expect(mockCallback.mock.calls.length).toBe(3);
        expect(mockCallback.mock.calls).toContainEqual(['value1', 'key1']);
        expect(mockCallback.mock.calls).toContainEqual(['value2', 'key2']);
        expect(mockCallback.mock.calls).toContainEqual(['value3', 'key3']);
      });
    });

    describe(Method.Ensure, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.ensure('key', 'defaultValue')).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.ensure('key', 'defaultValue')).rejects.toThrowError(multipleError);
      });

      test('GIVEN payload w/o data property THEN throws error', async () => {
        TestMiddleware.deleteData = true;

        await expect(josh.ensure('key', 'defaultValue')).rejects.toThrowError(josh['providerDataFailedError']);
      });

      test('GIVEN josh w/o data at key THEN returns data as defaultValue AND sets default value at key', async () => {
        const sizeBefore = await josh.size();

        expect(sizeBefore).toBe(0);

        const result = await josh.ensure('key', 'defaultValue');

        expect(result).toBe('defaultValue');

        const sizeAfter = await josh.size();

        expect(sizeAfter).toBe(1);
      });

      test('GIVEN josh w/ value at key THEN returns data as value at key', async () => {
        await josh.set('key', 'value');

        const result = await josh.ensure('key', 'defaultValue');

        expect(result).toBe('value');
      });
    });

    describe(Method.Entries, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.entries()).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.entries()).rejects.toThrowError(multipleError);
      });

      test('GIVEN payload w/o data property THEN throws error', async () => {
        TestMiddleware.deleteData = true;

        await expect(josh.entries()).rejects.toThrowError(josh['providerDataFailedError']);
      });

      test('GIVEN josh w/o data THEN returns data w/o data', async () => {
        const result = await josh.entries();

        expect(result).toEqual({});
      });

      test('GIVEN josh w/ data THEN returns data as Bulk.Object', async () => {
        await josh.set('key', 'value');

        const result = await josh.entries();

        expect(result).toEqual({ key: 'value' });
      });

      test('GIVEN josh w/ data THEN returns data as Bulk.Object', async () => {
        await josh.set('key', 'value');

        const result = await josh.entries(Bulk.Object);

        expect(result).toEqual({ key: 'value' });
      });

      test('GIVEN josh w/ data THEN returns data as Bulk.Map', async () => {
        await josh.set('key', 'value');

        const result = await josh.entries(Bulk.Map);

        expect(result).toBeInstanceOf(Map);
        expect(Array.from(result.entries())).toEqual([['key', 'value']]);
      });

      test('GIVEN josh w/ data THEN returns data as Bulk.OneDimensionalArray', async () => {
        await josh.set('key', 'value');

        const result = await josh.entries(Bulk.OneDimensionalArray);

        expect(result).toBeInstanceOf(Array);
        expect(result).toEqual(['value']);
      });

      test('GIVEN josh w/ data THEN returns data as Bulk.TwoDimensionalArray', async () => {
        await josh.set('key', 'value');

        const result = await josh.entries(Bulk.TwoDimensionalArray);

        expect(result).toBeInstanceOf(Array);
        expect(result).toEqual([['key', 'value']]);
      });
    });

    describe(Method.Every, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.every((value) => value === 'value')).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.every((value) => value === 'value')).rejects.toThrowError(multipleError);
      });

      test('GIVEN payload w/o data property THEN throws error', async () => {
        TestMiddleware.deleteData = true;

        await expect(josh.every((value) => value === 'value')).rejects.toThrowError(josh['providerDataFailedError']);
      });

      describe(Payload.Type.Hook, () => {
        test('GIVEN josh w/o data THEN returns true', async () => {
          const result = await josh.every((value) => value === 'value');

          expect(result).toBe(true);
        });

        test('GIVEN josh w/ data w/o value THEN rejects', async () => {
          const result = josh.every('path', undefined);

          await expect(result).rejects.toBeInstanceOf(JoshError);
        });

        test('GIVEN josh w/ data w/ invalid primitive THEN rejects', async () => {
          const result = josh.every('path', null);

          await expect(result).rejects.toBeInstanceOf(JoshError);
        });

        test('GIVEN josh w/ data THEN returns true', async () => {
          await josh.setMany([
            ['firstKey', 'value'],
            ['secondKey', 'value']
          ]);

          const result = await josh.every((value) => value === 'value');

          expect(result).toBe(true);
        });

        test('GIVEN josh w/ unique data THEN returns false', async () => {
          await josh.setMany([
            ['firstKey', 'value'],
            ['secondKey', 'not value']
          ]);

          const result = await josh.every((value) => value === 'value');

          expect(result).toBe(false);
        });
      });

      describe(Payload.Type.Value, () => {
        test('GIVEN josh w/o data THEN returns true', async () => {
          const result = await josh.every('path', 'value');

          expect(result).toBe(true);
        });

        test('GIVEN josh w/ data w/o path THEN returns true', async () => {
          await josh.setMany([
            ['firstKey', 'value'],
            ['secondKey', 'value']
          ]);

          const result = await josh.every([], 'value');

          expect(result).toBe(true);
        });

        test('GIVEN josh w/ data THEN returns true', async () => {
          await josh.setMany([
            ['firstKey', { path: 'value' }],
            ['secondKey', { path: 'value' }]
          ]);

          const result = await josh.every(['path'], 'value');

          expect(result).toBe(true);
        });
      });
    });

    describe(Method.Filter, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.filter((value) => value === 'value')).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.filter((value) => value === 'value')).rejects.toThrowError(multipleError);
      });

      test('GIVEN payload w/o data property THEN throws error', async () => {
        TestMiddleware.deleteData = true;

        await expect(josh.filter((value) => value === 'value')).rejects.toThrowError(josh['providerDataFailedError']);
      });

      describe(Payload.Type.Hook, () => {
        test('GIVEN josh w/o data THEN returns data w/o data from filter', async () => {
          const result = await josh.filter((value) => value === 'value');

          expect(result).toEqual({});
        });

        test('GIVEN josh w/ data w/o value THEN rejects', async () => {
          const result = josh.filter('path', undefined);

          await expect(result).rejects.toBeInstanceOf(JoshError);
        });

        test('GIVEN josh w/ data w/ invalid primitive THEN rejects', async () => {
          const result = josh.filter('path', null);

          await expect(result).rejects.toBeInstanceOf(JoshError);
        });

        test('GIVEN josh w/ data THEN returns data from filter', async () => {
          await josh.set('key', 'value');

          const result = await josh.filter((value) => value === 'value');

          expect(result).toEqual({ key: 'value' });
        });
      });

      describe(Payload.Type.Value, () => {
        test('GIVEN josh w/o data THEN returns data w/o data from filter', async () => {
          const result = await josh.filter('path', 'value');

          expect(result).toEqual({});
        });

        test('GIVEN josh w/ data THEN returns data from filter', async () => {
          await josh.set('key', 'value', 'path');

          const result = await josh.filter('path', 'value');

          expect(result).toEqual({ key: { path: 'value' } });
        });
      });
    });

    describe(Method.Find, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.find((value) => value === 'value')).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.find((value) => value === 'value')).rejects.toThrowError(multipleError);
      });

      test('GIVEN payload w/o data property THEN throws error', async () => {
        TestMiddleware.deleteData = true;

        await expect(josh.find((value) => value === 'value')).rejects.toThrowError(josh['providerDataFailedError']);
      });

      describe(Payload.Type.Hook, () => {
        test('GIVEN josh w/o data THEN returns data w/o data from find', async () => {
          const result = await josh.find((value) => value === 'value');

          expect(result).toEqual([null, null]);
        });

        test('GIVEN josh w/ data w/o value THEN rejects', async () => {
          const result = josh.find('path', undefined);

          await expect(result).rejects.toBeInstanceOf(JoshError);
        });

        test('GIVEN josh w/ data w/ invalid primitive THEN rejects', async () => {
          const result = josh.find('path', null);

          await expect(result).rejects.toBeInstanceOf(JoshError);
        });

        test('GIVEN josh w/ data THEN returns data from find', async () => {
          await josh.set('key', 'value');

          const result = await josh.find((value) => value === 'value');

          expect(result).toEqual(['key', 'value']);
        });
      });

      describe(Payload.Type.Value, () => {
        test('GIVEN josh w/o data THEN returns data w/o data from find', async () => {
          const result = await josh.find('path', 'value');

          expect(result).toEqual([null, null]);
        });

        test('GIVEN josh w/ data THEN returns data w/o data from find', async () => {
          await josh.set('key', 'value', 'path');

          const result = await josh.find('path', 'value');

          expect(result).toEqual(['key', { path: 'value' }]);
        });
      });
    });

    describe(Method.Get, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.get('key')).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.get('key')).rejects.toThrowError(multipleError);
      });

      test('GIVEN josh w/o data THEN returns data w/o data from get', async () => {
        const result = await josh.get('key');

        expect(result).toBeNull();
      });

      test('GIVEN josh w/ value at key THEN returns data from get at key', async () => {
        await josh.set('key', 'value');

        const result = await josh.get('key');

        expect(result).toBe('value');
      });

      test('GIVEN josh w/ value at path THEN returns data from get at path', async () => {
        await josh.set('key', 'value', 'path');

        const result = await josh.get('key', 'path');

        expect(result).toBe('value');
      });
    });

    describe(Method.GetMany, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.getMany([])).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.getMany([])).rejects.toThrowError(multipleError);
      });

      test('GIVEN payload w/o data property THEN throws error', async () => {
        TestMiddleware.deleteData = true;

        await expect(josh.getMany([])).rejects.toThrowError(josh['providerDataFailedError']);
      });

      test('GIVEN josh w/o data THEN returns data w/o data from getMany', async () => {
        await josh.set('key', null);

        const result = await josh.getMany(['key']);

        expect(result).toEqual({ key: null });
      });

      test('GIVEN josh w/ data THEN returns data as Bulk.Object', async () => {
        await josh.set('key', 'value');

        const result = await josh.getMany(['key']);

        expect(result).toEqual({ key: 'value' });
      });

      test('GIVEN josh w/ data THEN returns data as Bulk.Map', async () => {
        await josh.set('key', 'value');

        const result = await josh.getMany(['key'], Bulk.Map);

        expect(result).toBeInstanceOf(Map);
        expect(Array.from(result.entries())).toEqual([['key', 'value']]);
      });

      test('GIVEN josh w/ data THEN returns data as Bulk.OneDimensionalArray', async () => {
        await josh.set('key', 'value');

        const result = await josh.getMany(['key'], Bulk.OneDimensionalArray);

        expect(result).toBeInstanceOf(Array);
        expect(result).toEqual(['value']);
      });

      test('GIVEN josh w/ data THEN returns data as Bulk.OneDimensionalArray', async () => {
        await josh.set('key', 'value');

        const result = await josh.getMany(['key'], Bulk.TwoDimensionalArray);

        expect(result).toBeInstanceOf(Array);
        expect(result).toEqual([['key', 'value']]);
      });
    });

    describe(Method.Has, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.has('key')).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.has('key')).rejects.toThrowError(multipleError);
      });

      test('GIVEN payload w/o data property THEN throws error', async () => {
        TestMiddleware.deleteData = true;

        await expect(josh.has('key')).rejects.toThrowError(josh['providerDataFailedError']);
      });

      test('GIVEN josh w/o data at key THEN returns false', async () => {
        const has = await josh.has('key');

        expect(has).toBe(false);
      });

      test('GIVEN josh w/o data at path THEN returns false', async () => {
        await josh.set('key', 'value');

        const has = await josh.has('key', ['path']);

        expect(has).toBe(false);
      });

      test('GIVEN josh w/ data at key THEN returns true', async () => {
        await josh.set('key', 'value');

        const has = await josh.has('key');

        expect(has).toBe(true);
      });

      test('GIVEN josh w/ data at path THEN returns true', async () => {
        await josh.set('key', 'value', 'path');

        const has = await josh.has('key', ['path']);

        expect(has).toBe(true);
      });
    });

    describe(Method.Inc, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        await josh.set('key', 0);

        TestMiddleware.errorCount = 1;

        await expect(josh.inc('key')).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        await josh.set('key', 0);

        TestMiddleware.errorCount = 2;

        await expect(josh.inc('key')).rejects.toThrowError(multipleError);
      });

      test('GIVEN josh w/ number at key THEN incremented number at key', async () => {
        await josh.set('key', 0);

        const inced = await josh.inc('key');

        expect(inced).toBeInstanceOf(Josh);

        const value = await josh.get('key');

        expect(value).toBe(1);
      });

      test('GIVEN josh w/ number at path THEN incremented number at key and path', async () => {
        await josh.set('key', 0, 'path');

        const inced = await josh.inc('key', ['path']);

        expect(inced).toBeInstanceOf(Josh);

        const value = await josh.get<{ path: number }>('key');

        expect(value ? value.path : 0).toBe(1);
      });
    });

    describe(Method.Keys, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.keys()).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.keys()).rejects.toThrowError(multipleError);
      });

      test('GIVEN payload w/o data property THEN throws error', async () => {
        TestMiddleware.deleteData = true;

        await expect(josh.keys()).rejects.toThrowError(josh['providerDataFailedError']);
      });

      test('GIVEN josh w/o data THEN returns data w/o data from keys', async () => {
        const keys = await josh.keys();

        expect(keys).toEqual([]);
      });

      test('GIVEN josh w/ data THEN returns data from keys', async () => {
        await josh.set('key', 'value');

        const keys = await josh.keys();

        expect(keys).toEqual(['key']);
      });
    });

    describe(Method.Map, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.map((value) => value)).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.map((value) => value)).rejects.toThrowError(multipleError);
      });

      test('GIVEN payload w/o data property THEN throws error', async () => {
        TestMiddleware.deleteData = true;

        await expect(josh.map((value) => value)).rejects.toThrowError(josh['providerDataFailedError']);
      });

      describe(Payload.Type.Hook, () => {
        test('GIVEN josh w/o data THEN returns data w/o data', async () => {
          const mapped = await josh.map((value) => value);

          expect(mapped).toEqual([]);
        });

        test('GIVEN josh w/ data THEN returns data', async () => {
          await josh.set('key', 'value');

          const mapped = await josh.map((value) => value);

          expect(mapped).toEqual(['value']);
        });
      });

      describe(Payload.Type.Path, () => {
        test('GIVEN josh w/o data THEN returns data w/o data', async () => {
          const mapped = await josh.map([]);

          expect(mapped).toEqual([]);
        });

        test('GIVEN josh w/ data THEN returns data', async () => {
          await josh.set('key', 'value');

          const mapped = await josh.map([]);

          expect(mapped).toEqual(['value']);
        });

        test('GIVEN josh w/ data at path THEN returns data', async () => {
          await josh.set('key', 'value', 'path');

          const mapped = await josh.map(['path']);

          expect(mapped).toEqual(['value']);
        });
      });
    });

    describe(Method.Math, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        await josh.set('key', 0);

        TestMiddleware.errorCount = 1;

        await expect(josh.math('key', MathOperator.Addition, 1)).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        await josh.set('key', 0);

        TestMiddleware.errorCount = 2;

        await expect(josh.math('key', MathOperator.Addition, 1)).rejects.toThrowError(multipleError);
      });

      test('GIVEN josh w/ data THEN returns data', async () => {
        await josh.set('key', 0);

        const result = await josh.math('key', MathOperator.Addition, 1);

        expect(result).toBeInstanceOf(Josh);

        const value = await josh.get('key');

        expect(value).toBe(1);
      });
    });

    describe(Method.Partition, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.partition((value) => value === 'value')).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.partition((value) => value === 'value')).rejects.toThrowError(multipleError);
      });

      test('GIVEN payload w/o data property THEN throws error', async () => {
        TestMiddleware.deleteData = true;

        await expect(josh.partition((value) => value === 'value')).rejects.toThrowError(josh['providerDataFailedError']);
      });

      describe(Payload.Type.Hook, () => {
        test('GIVEN josh w/o data THEN returns data w/o data', async () => {
          const parted = await josh.partition((value) => value === 'value');

          expect(parted).toEqual([{}, {}]);
        });

        test('GIVEN josh w/ data w/o value THEN rejects', async () => {
          const parted = josh.partition('path', undefined);

          await expect(parted).rejects.toBeInstanceOf(JoshError);
        });

        test('GIVEN josh w/ data w/ invalid primitive THEN rejects', async () => {
          const parted = josh.partition('path', null);

          await expect(parted).rejects.toBeInstanceOf(JoshError);
        });

        test('GIVEN josh w/ data THEN returns data', async () => {
          await josh.set('key', 'value');

          const parted = await josh.partition((value) => value === 'value');

          expect(parted).toEqual([{ key: 'value' }, {}]);
        });

        test('GIVEN josh w/ data THEN returns data', async () => {
          await josh.set('key', 'value');

          const parted = await josh.partition((value) => value !== 'value');

          expect(parted).toEqual([{}, { key: 'value' }]);
        });
      });

      describe(Payload.Type.Value, () => {
        test('GIVEN josh w/o data THEN returns data w/o data', async () => {
          const parted = await josh.partition([], 'value');

          expect(parted).toEqual([{}, {}]);
        });

        test('GIVEN josh w/ data THEN returns data', async () => {
          await josh.set('key', 'value');

          const parted = await josh.partition([], 'value');

          expect(parted).toEqual([{ key: 'value' }, {}]);
        });

        test('GIVEN josh w/ data THEN returns data', async () => {
          await josh.set('key', 'value');

          const parted = await josh.partition([], 'anotherValue');

          expect(parted).toEqual([{}, { key: 'value' }]);
        });
      });
    });

    describe(Method.Push, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        await josh.set('key', []);

        TestMiddleware.errorCount = 1;

        await expect(josh.push('key', 'value')).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        await josh.set('key', []);

        TestMiddleware.errorCount = 2;

        await expect(josh.push('key', 'value')).rejects.toThrowError(multipleError);
      });

      test('GIVEN josh w/ array at key THEN returns data AND pushes value to array at key', async () => {
        await josh.set('key', []);

        const pushed = await josh.push('key', 'value');

        expect(pushed).toBeInstanceOf(Josh);

        const value = await josh.get('key');

        expect(value).toEqual(['value']);
      });

      test('GIVEN josh w/ array at path THEN returns data AND pushes value to array at path', async () => {
        await josh.set('key', { path: [] });

        const pushed = await josh.push('key', 'value', 'path');

        expect(pushed).toBeInstanceOf(Josh);

        const value = await josh.get<{ path: string[] }>('key');

        expect(value ? value.path : []).toEqual(['value']);
      });
    });

    describe(Method.Random, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.random()).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.random()).rejects.toThrowError(multipleError);
      });

      test('GIVEN josh w/ data THEN returns data from random', async () => {
        await josh.set('key', 'value');

        const random = await josh.random();

        expect(random).toEqual(['value']);
      });

      test('GIVEN josh w/o data THEN throw provider error', async () => {
        const random = josh.random();

        await expect(random).rejects.toThrowError(josh['providerDataFailedError']);
      });

      test('GIVEN josh w/ data THEN returns data from random', async () => {
        await josh.set('key', 'value');

        const random = await josh.random({ count: 1, duplicates: false });

        expect(random).toEqual(['value']);
      });

      test('GIVEN josh w/ data THEN returns multiple data from random', async () => {
        await josh.set('key', 'value');
        await josh.set('key2', 'value');

        const random = await josh.random({ count: 2, duplicates: false });

        expect(random).toEqual(['value', 'value']);
      });

      test('GIVEN josh w/ data w/ duplicates THEN returns multiple data from random', async () => {
        await josh.set('key', 'value');
        await josh.set('key2', 'value');

        const random = await josh.random({ count: 2, duplicates: true });

        expect(random).toEqual(['value', 'value']);
      });
    });

    describe(Method.RandomKey, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.randomKey()).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.randomKey()).rejects.toThrowError(multipleError);
      });

      test('GIVEN josh w/ data THEN returns data from randomKey', async () => {
        await josh.set('key', 'value');

        const random = await josh.randomKey();

        expect(random).toEqual(['key']);
      });

      test('GIVEN josh w/o data THEN throw provider error', async () => {
        const random = josh.randomKey();

        await expect(random).rejects.toThrowError(josh['providerDataFailedError']);
      });

      test('GIVEN josh w/ data THEN returns data from random', async () => {
        await josh.set('key', 'value');

        const random = await josh.randomKey({ count: 1, duplicates: false });

        expect(random).toEqual(['key']);
      });

      test('GIVEN josh w/ data THEN returns multiple data from random', async () => {
        await josh.set('key', 'value');
        await josh.set('key2', 'value');

        const random = await josh.randomKey({ count: 2, duplicates: false });

        expect(random?.length).toEqual(2);
      });

      test('GIVEN josh w/ data w/ duplicates THEN returns multiple data from random', async () => {
        await josh.set('key', 'value');
        await josh.set('key2', 'value');

        const random = await josh.randomKey({ count: 2, duplicates: true });

        expect(random?.length).toEqual(2);
      });
    });

    describe(Method.Remove, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        await josh.set('key', ['value']);

        TestMiddleware.errorCount = 1;

        await expect(josh.remove('key', 'value')).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        await josh.set('key', ['value']);

        TestMiddleware.errorCount = 2;

        await expect(josh.remove('key', 'value')).rejects.toThrowError(multipleError);
      });

      test('GIVEN josh w/ data w/ invalid primitive THEN rejects', async () => {
        const result = josh.remove('path', null);

        await expect(result).rejects.toBeInstanceOf(JoshError);
      });

      describe(Payload.Type.Hook, () => {
        test('GIVEN josh w/ array at key THEN returns data AND removes value from array at key', async () => {
          await josh.set('key', ['value']);

          const getBefore = await josh.get('key');

          expect(getBefore).toEqual(['value']);

          const result = await josh.remove('key', (value: string) => value === 'value', []);

          expect(result).toBeInstanceOf(Josh);

          const getAfter = await josh.get('key');

          expect(getAfter).toEqual([]);
        });
      });

      describe(Payload.Type.Value, () => {
        test('GIVEN josh w/ array at key THEN returns data AND removes value from array at key', async () => {
          await josh.set('key', ['value']);

          const getBefore = await josh.get('key');

          expect(getBefore).toEqual(['value']);

          const result = await josh.remove('key', 'value', []);

          expect(result).toBeInstanceOf(Josh);

          const getAfter = await josh.get('key');

          expect(getAfter).toEqual([]);
        });
      });
    });

    describe(Method.Set, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.set('key', 'value')).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.set('key', 'value')).rejects.toThrowError(multipleError);
      });

      test('GIVEN josh w/o data THEN returns data AND sets value at key', async () => {
        const hasBefore = await josh.has('key');

        expect(hasBefore).toBe(false);

        const result = await josh.set('key', 'value');

        expect(result).toBeInstanceOf(Josh);

        const hasAfter = await josh.has('key');

        expect(hasAfter).toBe(true);
      });

      test('GIVEN josh w/o data THEN returns data AND sets value at key and path', async () => {
        const hasBefore = await josh.has('key', ['path']);

        expect(hasBefore).toBe(false);

        const result = await josh.set('key', 'value', 'path');

        expect(result).toBeInstanceOf(Josh);

        const hasAfter = await josh.has('key', ['path']);

        expect(hasAfter).toBe(true);
      });
    });

    describe(Method.SetMany, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.setMany([['key', 'value']])).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.setMany([['key', 'value']])).rejects.toThrowError(multipleError);
      });

      test('GIVEN josh w/o data THEN returns data AND sets value at key', async () => {
        const hasBefore = await josh.has('key');

        expect(hasBefore).toBe(false);

        const result = await josh.setMany([
          [{ key: 'key', path: [] }, 'value'],
          [{ key: 'key2' }, 'value']
        ]);

        expect(result).toBeInstanceOf(Josh);

        const entries = await josh.entries();

        expect(entries).toEqual({ key: 'value', key2: 'value' });
      });

      test('GIVEN josh w/ data THEN returns data AND does not set value at key', async () => {
        await josh.set('key', 'value');

        const result = await josh.setMany([[{ key: 'key', path: [] }, 'value-overwritten']], false);

        expect(result).toBeInstanceOf(Josh);

        const entries = await josh.entries();

        expect(entries).toEqual({ key: 'value' });
      });
    });

    describe(Method.Size, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.size()).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.size()).rejects.toThrowError(multipleError);
      });

      test('GIVEN payload w/o data property THEN throws error', async () => {
        TestMiddleware.deleteData = true;

        await expect(josh.size()).rejects.toThrowError(josh['providerDataFailedError']);
      });

      test('GIVEN josh w/o data THEN returns 0', async () => {
        const result = await josh.size();

        expect(result).toBe(0);
      });

      test('GIVEN josh w/ data THEN returns 1)', async () => {
        await josh.set('key', 'value');

        const result = await josh.size();

        expect(result).toBe(1);
      });
    });

    describe(Method.Some, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.some((value) => value === 'value')).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.some((value) => value === 'value')).rejects.toThrowError(multipleError);
      });

      test('GIVEN payload w/o data property THEN throws error', async () => {
        TestMiddleware.deleteData = true;

        await expect(josh.some((value) => value === 'value')).rejects.toThrowError(josh['providerDataFailedError']);
      });

      describe(Payload.Type.Hook, () => {
        test('GIVEN josh w/o data THEN returns false', async () => {
          const result = await josh.some((value) => value === 'value');

          expect(result).toBe(false);
        });

        test('GIVEN josh w/ data w/o value THEN rejects', async () => {
          const result = josh.some('path', undefined);

          await expect(result).rejects.toBeInstanceOf(JoshError);
        });

        test('GIVEN josh w/ data w/ invalid primitive THEN rejects', async () => {
          const result = josh.some('path', null);

          await expect(result).rejects.toBeInstanceOf(JoshError);
        });

        test('GIVEN josh w/ data THEN returns true', async () => {
          await josh.set('key', { path: 'value' });

          const result = await josh.some(['path'], 'value');

          expect(result).toBe(true);
        });
      });

      describe(Payload.Type.Value, () => {
        test('GIVEN josh w/o data THEN returns false', async () => {
          const result = await josh.some((value) => value === 'value');

          expect(result).toBe(false);
        });

        test('GIVEN josh w/ data THEN returns true', async () => {
          await josh.set('key', 'value');

          try {
            const result = await josh.some([], 'value');

            expect(result).toBe(true);
          } catch (err) {
            console.log(err);
          }
        });
      });
    });

    describe(Method.Update, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        await josh.set('key', 'value');

        TestMiddleware.errorCount = 1;

        await expect(josh.update('key', (value) => (value as string).toUpperCase())).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        await josh.set('key', 'value');

        TestMiddleware.errorCount = 2;

        await expect(josh.update('key', (value) => (value as string).toUpperCase())).rejects.toThrowError(multipleError);
      });

      test('GIVEN josh w/ data at key THEN returns data AND updates value at key', async () => {
        await josh.set('key', 'value');

        const result = await josh.update('key', (value) => value);

        expect(result).toBeInstanceOf(Josh);
      });

      test('GIVEN josh w/ data at path THEN returns data AND updates value at path', async () => {
        await josh.set('key', 'value', 'path');

        const result = await josh.update('key', (value) => value);

        expect(result).toBeInstanceOf(Josh);
      });
    });

    describe(Method.Values, () => {
      test('GIVEN payload w/ error THEN throws error', async () => {
        TestMiddleware.errorCount = 1;

        await expect(josh.values()).rejects.toThrowError(errors[0]);
      });

      test('GIVEN payload w/ multiple errors THEN throws error', async () => {
        TestMiddleware.errorCount = 2;

        await expect(josh.values()).rejects.toThrowError(multipleError);
      });

      test('GIVEN payload w/o data property THEN throws error', async () => {
        TestMiddleware.deleteData = true;

        await expect(josh.values()).rejects.toThrowError(josh['providerDataFailedError']);
      });

      test('GIVEN josh w/o data THEN returns data w/o data', async () => {
        const result = await josh.values();

        expect(result).toEqual([]);
      });

      test('GIVEN josh w/ data THEN returns data', async () => {
        await josh.set('key', 'value');

        const result = await josh.values();

        expect(result).toEqual(['value']);
      });
    });

    describe('import', () => {
      test('GIVEN josh w/ data THEN exports data THEN imports', async () => {
        await josh.set('key', 'value');

        const json = await josh.export();

        await josh.import({ json, clear: true, overwrite: true });

        const result = await josh.entries();

        expect(result).toEqual({ key: 'value' });
      });

      test('GIVEN josh w/ data THEN exports data THEN imports', async () => {
        await josh.set('key', 'not-value');

        const json = await josh.export();

        await josh.set('key', 'real-value');

        await josh.import({ json, overwrite: false });

        const result = await josh.entries();

        expect(result).toEqual({ key: 'real-value' });
      });

      test('GIVEN fake legacy data THEN imports and converts', async () => {
        const legacy = {
          name: 'test',
          version: '1.0.0',
          exportDate: Date.now(),
          keys: [{ key: 'foo', value: 'bar' }]
        };

        await josh.import({ json: legacy });

        const result = await josh.entries();

        expect(result).toEqual({ foo: 'bar' });
      });
    });

    describe('export', () => {
      test('GIVEN josh w/ data THEN exports data', async () => {
        await josh.set('key', 'value');

        const exported = await josh.export();

        expect(exported.entries).toEqual([['key', 'value']]);
        expect(exported.exportedTimestamp).toBeGreaterThan(0);
        expect(exported.name).toBe('test');
      });
    });

    describe('multi', () => {
      test("GIVEN josh w/ data THEN multi's data", () => {
        const result = Josh.multi(['foo', 'bar']);

        expect(result.foo).toBeInstanceOf(Josh);
        expect(result.bar).toBeInstanceOf(Josh);

        expect(result.foo.name).toBe('foo');
        expect(result.bar.name).toBe('bar');
      });
    });
  });
});
