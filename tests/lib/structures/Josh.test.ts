import { AutoEnsureMiddleware } from '@joshdb/auto-ensure';
import { MathOperator, Method, Middleware, Payload, Trigger } from '@joshdb/middleware';
import { Bulk, Josh, JoshError } from '../../../src';

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
      const josh = new Josh({ name: 'test:name' });
      expect(josh).toBeInstanceOf(Josh);
    });

    test('GIVEN class Josh w/o name THEN throws error', () => {
      expect(() => new Josh({ name: undefined })).toThrowError('The "name" option is required to initiate a Josh instance');
    });

    test('GIVEN class Josh w/ autoEnsure THEN returns middleware size 1', () => {
      const josh = new Josh({ name: 'test:name', autoEnsure: { defaultValue: { foo: 'bar' } } });
      expect(josh.middlewares.size).toBe(1);
    });

    test('GIVEN class Josh w/ empty middlewares THEN returns instance', () => {
      const josh = new Josh({ name: 'test:name', middlewares: [] });
      expect(josh.middlewares.size).toBe(0);
    });

    test('GIVEN class Josh w/ middlewares THEN returns instance', () => {
      const josh = new Josh<{ test: boolean }>({
        name: 'test:name',
        // For nova, this seems to be the only way to make sure the middleware is allowed
        middlewares: [new AutoEnsureMiddleware({ defaultValue: { test: false } }) as unknown as Middleware<{ test: boolean }>]
      });

      expect(josh.middlewares.size).toBe(1);
    });

    test('GIVEN provider with invalid instance THEN emits warning', () => {
      const spy = jest.spyOn(process, 'emitWarning').mockImplementation();
      // @ts-expect-error - this is a test
      const josh = new Josh({ name: 'test:instanceof', provider: new Map() });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(process.emitWarning).toHaveBeenCalledWith(
        expect.stringContaining('The "provider" option must extend the exported "JoshProvider" class to ensure compatibility, but continuing anyway.')
      );

      spy.mockClear();
    });

    test('GIVEN provider with invalid instance THEN emits warning', () => {
      jest.spyOn(process, 'emitWarning').mockImplementation();
      // @ts-expect-error - this is a test
      const josh = new Josh({ name: 'test:middlewares', middlewares: [new Map()] });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(process.emitWarning).toHaveBeenCalledWith(expect.stringContaining('The middleware must extend the exported "Middleware" class.'));
    });
  });

  describe('middleware', () => {
    describe('use', () => {
      test('GIVEN josh THEN add middleware', () => {
        const josh = new Josh({ name: 'test:middlewares' });

        expect(josh.middlewares.size).toBe(0);

        josh.use(new AutoEnsureMiddleware({ defaultValue: { test: false } }) as unknown as Middleware<{ test: boolean }>);

        expect(josh.middlewares.size).toBe(1);
      });

      test('GIVEN josh w/ hook middleware THEN add middleware', () => {
        const josh = new Josh({ name: 'test:middlewares' });

        expect(josh.middlewares.size).toBe(0);

        josh.use({ name: 'test' }, (payload) => payload);

        expect(josh.middlewares.get('test')?.conditions).toEqual({ pre: [], post: [] });

        expect(josh.middlewares.size).toBe(1);
      });

      test('GIVEN josh w/ hook middleware w/ trigger THEN add middleware', () => {
        const josh = new Josh({ name: 'test:middlewares' });

        expect(josh.middlewares.size).toBe(0);

        josh.use({ name: 'test', trigger: Trigger.PreProvider, method: Method.Dec }, (payload) => payload);

        expect(josh.middlewares.size).toBe(1);
        expect(josh.middlewares.get('test')?.conditions.pre).toEqual(['dec']);
        expect(josh.middlewares.get('test')?.conditions.post).toEqual([]);
      });

      test('GIVEN josh w/ hook middleware w/ trigger THEN add middleware', () => {
        const josh = new Josh({ name: 'test:middlewares' });

        expect(josh.middlewares.size).toBe(0);

        josh.use({ name: 'test', trigger: Trigger.PostProvider, method: Method.Dec }, (payload) => payload);

        expect(josh.middlewares.size).toBe(1);
        expect(josh.middlewares.get('test')?.conditions.post).toEqual(['dec']);
        expect(josh.middlewares.get('test')?.conditions.pre).toEqual([]);
      });

      test('GIVEN josh w/ invalid hook middleware THEN add middleware', () => {
        const josh = new Josh({ name: 'test:middlewares' });

        expect(josh.middlewares.size).toBe(0);

        // @ts-expect-error this is a test
        expect(() => josh.use({ name: 'test' })).toThrowError('The "hook" parameter for middleware was not found.');

        expect(josh.middlewares.size).toBe(0);
      });
    });
  });

  describe('resolvePath', () => {
    const josh = new Josh({ name: 'test:name' });

    test('resolvePath', () => {
      expect(josh['resolvePath']('test.path')).toEqual(['test', 'path']);
      expect(josh['resolvePath']('test.path.to.file')).toEqual(['test', 'path', 'to', 'file']);
      expect(josh['resolvePath']('test.path.to[0].index')).toEqual(['test', 'path', 'to', '0', 'index']);
      expect(josh['resolvePath']('test[0].path.to[1].index')).toEqual(['test', '0', 'path', 'to', '1', 'index']);
    });
  });

  describe('can manipulate data', () => {
    const josh = new Josh({ name: 'test' });

    beforeAll(async () => {
      await josh.init();
    });

    beforeEach(async () => {
      await josh[Method.Clear]();
    });

    afterAll(async () => {
      await josh[Method.Clear]();
    });

    describe(Method.AutoKey, () => {
      test('GIVEN ... THEN returns data w/ generated key as data AND increments autoKeyCount', async () => {
        const data = await josh[Method.AutoKey]();

        expect(typeof data).toBe('string');
      });

      test('each value of autoKey should be unique', async () => {
        const arr = await Promise.all([...Array(10)].map(async () => josh[Method.AutoKey]()));
        const isUnique = new Set(arr).size === arr.length;

        expect(isUnique).toBe(true);
      });
    });

    describe(Method.Clear, () => {
      test('GIVEN josh w/o data THEN provider data cleared', async () => {
        const sizeBefore = await josh[Method.Size]();

        expect(sizeBefore).toBe(0);

        const result = await josh[Method.Clear]();

        expect(result).toBeInstanceOf(Josh);

        const sizeAfter = await josh[Method.Size]();

        expect(sizeAfter).toBe(0);
      });

      test('GIVEN josh w/ data THEN provider data cleared', async () => {
        await josh[Method.Set]('test:clear', 'value');

        const sizeBefore = await josh[Method.Size]();

        expect(sizeBefore).toBe(1);

        const result = await josh[Method.Clear]();

        expect(result).toBeInstanceOf(Josh);

        const sizeAfter = await josh[Method.Size]();

        expect(sizeAfter).toBe(0);
      });
    });

    describe(Method.Dec, () => {
      test('GIVEN josh w/ number at key THEN decremented number at key', async () => {
        await josh[Method.Set]('test:dec', 1);

        const result = await josh[Method.Dec]('test:dec');

        expect(result).toBeInstanceOf(Josh);

        const value = await josh[Method.Get]('test:dec');

        expect(value).toBe(0);
      });

      test('GIVEN josh w/ number at path THEN decremented number at path', async () => {
        await josh[Method.Set]('test:dec', 1, ['path']);

        const result = await josh[Method.Dec]('test:dec', ['path']);

        expect(result).toBeInstanceOf(Josh);

        const value = await josh[Method.Get]('test:dec', ['path']);

        expect(value).toBe(0);
      });
    });

    describe(Method.Delete, () => {
      test('GIVEN josh w/ value at key THEN deletes value at key', async () => {
        await josh[Method.Set]('test:delete', 'value');

        const hasBefore = await josh[Method.Has]('test:delete');

        expect(hasBefore).toBe(true);

        const result = await josh[Method.Delete]('test:delete');

        expect(result).toBeInstanceOf(Josh);

        const hasAfter = await josh[Method.Has]('test:delete');

        expect(hasAfter).toBe(false);
      });

      test('GIVEN josh w/ value at path THEN deletes value at path', async () => {
        await josh[Method.Set]('test:delete', 'value');

        const hasBefore = await josh[Method.Has]('test:delete');

        expect(hasBefore).toBe(true);

        const result = await josh[Method.Delete]('test:delete', ['path']);

        expect(result).toBeInstanceOf(Josh);

        const hasAfter = await josh[Method.Has]('test:delete', ['path']);

        expect(hasAfter).toBe(false);
      });

      test('GIVEN josh w/ value at nested path THEN deletes value at nested path', async () => {
        await josh[Method.Set]('test:delete', 'value', ['path', 'nested']);

        const hasBefore = await josh[Method.Has]('test:delete', ['path', 'nested']);

        expect(hasBefore).toBe(true);

        const result = await josh[Method.Delete]('test:delete', ['path', 'nested']);

        expect(result).toBeInstanceOf(Josh);

        const hasAfter = await josh[Method.Has]('test:delete', ['path', 'nested']);

        expect(hasAfter).toBe(false);
      });
    });

    describe(Method.DeleteMany, () => {
      test('GIVEN josh w/ value at key THEN deletes value at key', async () => {
        await josh[Method.Set]('test:deletemany', 'value');

        const hasBefore = await josh[Method.Has]('test:deletemany');

        expect(hasBefore).toBe(true);

        const result = await josh[Method.DeleteMany](['test:deletemany']);

        expect(result).toBeInstanceOf(Josh);

        const hasAfter = await josh[Method.Has]('test:deletemany');

        expect(hasAfter).toBe(false);
      });

      test('GIVEN josh w/ multiple result at keys THEN deletes result at keys', async () => {
        await josh[Method.Set]('test:deletemany', 'value');
        await josh[Method.Set]('test:deletemany2', 'value');

        const hasBefore = (await josh[Method.Has]('test:deletemany')) && (await josh[Method.Has]('test:deletemany2'));

        expect(hasBefore).toBe(true);

        const result = await josh[Method.DeleteMany](['test:deletemany', 'test:deletemany2']);

        expect(result).toBeInstanceOf(Josh);

        const hasAfter = (await josh[Method.Has]('test:deletemany')) && (await josh[Method.Has]('test:deletemany2'));

        expect(hasAfter).toBe(false);
      });
    });

    describe(Method.Ensure, () => {
      test('GIVEN josh w/o data at key THEN returns data as defaultValue AND sets default value at key', async () => {
        const sizeBefore = await josh[Method.Size]();

        expect(sizeBefore).toBe(0);

        const result = await josh[Method.Ensure]('test:ensure', 'defaultValue');

        expect(result).toBe('defaultValue');

        const sizeAfter = await josh[Method.Size]();

        expect(sizeAfter).toBe(1);
      });

      test('GIVEN josh w/ value at key THEN returns data as value at key', async () => {
        await josh[Method.Set]('test:ensure', 'value');

        const result = await josh[Method.Ensure]('test:ensure', 'defaultValue');

        expect(result).toBe('value');
      });
    });

    describe(Method.Entries, () => {
      test('GIVEN josh w/o data THEN returns data w/o data', async () => {
        const result = await josh[Method.Entries]();

        expect(result).toEqual({});
      });

      test('GIVEN josh w/ data THEN returns data as Bulk.Object', async () => {
        await josh[Method.Set]('test:entries', 'value');

        const result = await josh[Method.Entries]();

        expect(result).toEqual({ 'test:entries': 'value' });
      });

      test('GIVEN josh w/ data THEN returns data as Bulk.Object', async () => {
        await josh[Method.Set]('test:entries', 'value');

        const result = await josh[Method.Entries](Bulk.Object);

        expect(result).toEqual({ 'test:entries': 'value' });
      });

      test('GIVEN josh w/ data THEN returns data as Bulk.Map', async () => {
        await josh[Method.Set]('test:entries', 'value');

        const result = await josh[Method.Entries](Bulk.Map);

        expect(result).toBeInstanceOf(Map);
        expect(Array.from(result.entries())).toEqual([['test:entries', 'value']]);
      });

      test('GIVEN josh w/ data THEN returns data as Bulk.OneDimensionalArray', async () => {
        await josh[Method.Set]('test:entries', 'value');

        const result = await josh[Method.Entries](Bulk.OneDimensionalArray);

        expect(result).toBeInstanceOf(Array);
        expect(result).toEqual(['value']);
      });

      test('GIVEN josh w/ data THEN returns data as Bulk.TwoDimensionalArray', async () => {
        await josh[Method.Set]('test:entries', 'value');

        const result = await josh[Method.Entries](Bulk.TwoDimensionalArray);

        expect(result).toBeInstanceOf(Array);
        expect(result).toEqual([['test:entries', 'value']]);
      });
    });

    describe(Method.Every, () => {
      describe(Payload.Type.Hook, () => {
        test('GIVEN josh w/o data THEN returns true', async () => {
          const result = await josh[Method.Every]((value) => value === 'value');

          expect(result).toBe(true);
        });

        test('GIVEN josh w/ data w/o value THEN rejects', async () => {
          const result = josh[Method.Every]('path', undefined);

          await expect(result).rejects.toBeInstanceOf(JoshError);
        });

        test('GIVEN josh w/ data w/ invalid primitive THEN rejects', async () => {
          const result = josh[Method.Every]('path', null);

          await expect(result).rejects.toBeInstanceOf(JoshError);
        });

        test('GIVEN josh w/ data THEN returns true', async () => {
          await josh[Method.SetMany]([
            ['firstKey', 'value'],
            ['secondKey', 'value']
          ]);

          const result = await josh[Method.Every]((value) => value === 'value');
          expect(result).toBe(true);
        });

        test('GIVEN josh w/ unique data THEN returns false', async () => {
          await josh[Method.SetMany]([
            ['firstKey', 'value'],
            ['secondKey', 'not value']
          ]);

          const result = await josh[Method.Every]((value) => value === 'value');
          expect(result).toBe(false);
        });
      });

      describe(Payload.Type.Value, () => {
        test('GIVEN josh w/o data THEN returns true', async () => {
          const result = await josh[Method.Every]('path', 'value');

          expect(result).toBe(true);
        });

        test('GIVEN josh w/ data w/o path THEN returns true', async () => {
          await josh[Method.SetMany]([
            ['firstKey', 'value'],
            ['secondKey', 'value']
          ]);

          const result = await josh[Method.Every]([], 'value');

          expect(result).toBe(true);
        });

        test('GIVEN josh w/ data THEN returns true', async () => {
          await josh[Method.SetMany]([
            ['firstKey', { path: 'value' }],
            ['secondKey', { path: 'value' }]
          ]);

          const result = await josh[Method.Every](['path'], 'value');
          expect(result).toBe(true);
        });
      });
    });

    describe(Method.Filter, () => {
      describe(Payload.Type.Hook, () => {
        test('GIVEN josh w/o data THEN returns data w/o data from filter', async () => {
          const result = await josh[Method.Filter]((value) => value === 'value');

          expect(result).toEqual({});
        });

        test('GIVEN josh w/ data w/o value THEN rejects', async () => {
          const result = josh[Method.Filter]('path', undefined);

          await expect(result).rejects.toBeInstanceOf(JoshError);
        });

        test('GIVEN josh w/ data w/ invalid primitive THEN rejects', async () => {
          const result = josh[Method.Filter]('path', null);

          await expect(result).rejects.toBeInstanceOf(JoshError);
        });

        test('GIVEN josh w/ data THEN returns data from filter', async () => {
          await josh[Method.Set]('test:filter', 'value');

          const result = await josh[Method.Filter]((value) => value === 'value');

          expect(result).toEqual({ 'test:filter': 'value' });
        });
      });

      describe(Payload.Type.Value, () => {
        test('GIVEN josh w/o data THEN returns data w/o data from filter', async () => {
          const result = await josh[Method.Filter]('path', 'value');

          expect(result).toEqual({});
        });

        test('GIVEN josh w/ data THEN returns data from filter', async () => {
          await josh[Method.Set]('test:filter', 'value', 'path');

          const result = await josh[Method.Filter]('path', 'value');

          expect(result).toEqual({ 'test:filter': { path: 'value' } });
        });
      });
    });

    describe(Method.Find, () => {
      describe(Payload.Type.Hook, () => {
        test('GIVEN josh w/o data THEN returns data w/o data from find', async () => {
          const result = await josh[Method.Find]((value) => value === 'value');

          expect(result).toEqual([null, null]);
        });

        test('GIVEN josh w/ data w/o value THEN rejects', async () => {
          const result = josh[Method.Find]('path', undefined);

          await expect(result).rejects.toBeInstanceOf(JoshError);
        });

        test('GIVEN josh w/ data w/ invalid primitive THEN rejects', async () => {
          const result = josh[Method.Find]('path', null);

          await expect(result).rejects.toBeInstanceOf(JoshError);
        });

        test('GIVEN josh w/ data THEN returns data from find', async () => {
          await josh[Method.Set]('test:find', 'value');

          const result = await josh[Method.Find]((value) => value === 'value');

          expect(result).toEqual(['test:find', 'value']);
        });
      });

      describe(Payload.Type.Value, () => {
        test('GIVEN josh w/o data THEN returns data w/o data from find', async () => {
          const result = await josh[Method.Find]('path', 'value');

          expect(result).toEqual([null, null]);
        });

        test('GIVEN josh w/ data THEN returns data w/o data from find', async () => {
          await josh[Method.Set]('test:find', 'value', 'path');

          const result = await josh[Method.Find]('path', 'value');

          expect(result).toEqual(['test:find', { path: 'value' }]);
        });
      });
    });

    describe(Method.Get, () => {
      test('GIVEN josh w/o data THEN returns data w/o data from get', async () => {
        const result = await josh[Method.Get]('test:get');

        expect(result).toBeNull();
      });

      test('GIVEN josh w/ value at key THEN returns data from get at key', async () => {
        await josh[Method.Set]('test:get', 'value');

        const result = await josh[Method.Get]('test:get');

        expect(result).toBe('value');
      });

      test('GIVEN josh w/ value at path THEN returns data from get at path', async () => {
        await josh[Method.Set]('test:get', 'value', 'path');

        const result = await josh[Method.Get]('test:get', 'path');

        expect(result).toBe('value');
      });
    });

    describe(Method.GetMany, () => {
      test('GIVEN josh w/o data THEN returns data w/o data from getMany', async () => {
        await josh[Method.Set]('test:getMany', null);

        const result = await josh[Method.GetMany](['test:getMany']);

        expect(result).toEqual({ 'test:getMany': null });
      });

      test('GIVEN josh w/ data THEN returns data as Bulk.Object', async () => {
        await josh[Method.Set]('test:getMany', 'value');

        const result = await josh[Method.GetMany](['test:getMany']);

        expect(result).toEqual({ 'test:getMany': 'value' });
      });

      test('GIVEN josh w/ data THEN returns data as Bulk.Map', async () => {
        await josh[Method.Set]('test:getMany', 'value');

        const result = await josh[Method.GetMany](['test:getMany'], Bulk.Map);

        expect(result).toBeInstanceOf(Map);
        expect(Array.from(result.entries())).toEqual([['test:getMany', 'value']]);
      });

      test('GIVEN josh w/ data THEN returns data as Bulk.OneDimensionalArray', async () => {
        await josh[Method.Set]('test:getMany', 'value');

        const result = await josh[Method.GetMany](['test:getMany'], Bulk.OneDimensionalArray);

        expect(result).toBeInstanceOf(Array);
        expect(result).toEqual(['value']);
      });

      test('GIVEN josh w/ data THEN returns data as Bulk.OneDimensionalArray', async () => {
        await josh[Method.Set]('test:getMany', 'value');

        const result = await josh[Method.GetMany](['test:getMany'], Bulk.TwoDimensionalArray);

        expect(result).toBeInstanceOf(Array);
        expect(result).toEqual([['test:getMany', 'value']]);
      });
    });

    describe(Method.Has, () => {
      test('GIVEN josh w/o data at key THEN returns false', async () => {
        const has = await josh[Method.Has]('test:has');

        expect(has).toBe(false);
      });

      test('GIVEN josh w/o data at path THEN returns false', async () => {
        await josh[Method.Set]('test:has', 'value');

        const has = await josh[Method.Has]('test:has', ['path']);

        expect(has).toBe(false);
      });

      test('GIVEN josh w/ data at key THEN returns true', async () => {
        await josh[Method.Set]('test:has', 'value');

        const has = await josh[Method.Has]('test:has');

        expect(has).toBe(true);
      });

      test('GIVEN josh w/ data at path THEN returns true', async () => {
        await josh[Method.Set]('test:has', 'value', 'path');

        const has = await josh[Method.Has]('test:has', ['path']);

        expect(has).toBe(true);
      });
    });

    describe(Method.Inc, () => {
      test('GIVEN josh w/ number at key THEN incremented number at key', async () => {
        await josh[Method.Set]('test:inc', 0);

        const inced = await josh[Method.Inc]('test:inc');

        expect(inced).toBeInstanceOf(Josh);

        const value = await josh[Method.Get]('test:inc');

        expect(value).toBe(1);
      });

      test('GIVEN josh w/ number at path THEN incremented number at key and path', async () => {
        await josh[Method.Set]('test:inc', 0, 'path');

        const inced = await josh[Method.Inc]('test:inc', ['path']);

        expect(inced).toBeInstanceOf(Josh);

        const value = await josh[Method.Get]<{ path: number }>('test:inc');

        expect(value ? value.path : 0).toBe(1);
      });
    });

    describe(Method.Keys, () => {
      test('GIVEN josh w/o data THEN returns data w/o data from keys', async () => {
        const keys = await josh[Method.Keys]();

        expect(keys).toEqual([]);
      });

      test('GIVEN josh w/ data THEN returns data from keys', async () => {
        await josh[Method.Set]('test:keys', 'value');

        const keys = await josh[Method.Keys]();

        expect(keys).toEqual(['test:keys']);
      });
    });

    describe(Method.Map, () => {
      describe(Payload.Type.Hook, () => {
        test('GIVEN josh w/o data THEN returns data w/o data', async () => {
          const mapped = await josh[Method.Map]((value) => value);

          expect(mapped).toEqual([]);
        });

        test('GIVEN josh w/ data THEN returns data', async () => {
          await josh[Method.Set]('test:map', 'value');

          const mapped = await josh[Method.Map]((value) => value);

          expect(mapped).toEqual(['value']);
        });
      });

      describe(Payload.Type.Path, () => {
        test('GIVEN josh w/o data THEN returns data w/o data', async () => {
          const mapped = await josh[Method.Map]([]);

          expect(mapped).toEqual([]);
        });

        test('GIVEN josh w/ data THEN returns data', async () => {
          await josh[Method.Set]('test:map', 'value');

          const mapped = await josh[Method.Map]([]);

          expect(mapped).toEqual(['value']);
        });

        test('GIVEN josh w/ data at path THEN returns data', async () => {
          await josh[Method.Set]('test:map', 'value', 'path');

          const mapped = await josh[Method.Map](['path']);

          expect(mapped).toEqual(['value']);
        });
      });
    });

    describe(Method.Math, () => {
      test('GIVEN josh w/ data THEN returns data', async () => {
        await josh[Method.Set]('test:math', 0);

        const mathed = await josh[Method.Math]('test:math', MathOperator.Addition, 1);

        expect(mathed).toBeInstanceOf(Josh);

        const value = await josh[Method.Get]('test:math');

        expect(value).toBe(1);
      });
    });

    describe(Method.Partition, () => {
      describe(Payload.Type.Hook, () => {
        test('GIVEN josh w/o data THEN returns data w/o data', async () => {
          const parted = await josh[Method.Partition]((value) => value === 'value');

          expect(parted).toEqual([{}, {}]);
        });

        test('GIVEN josh w/ data w/o value THEN rejects', async () => {
          const parted = josh[Method.Partition]('path', undefined);

          await expect(parted).rejects.toBeInstanceOf(JoshError);
        });

        test('GIVEN josh w/ data w/ invalid primitive THEN rejects', async () => {
          const parted = josh[Method.Partition]('path', null);

          await expect(parted).rejects.toBeInstanceOf(JoshError);
        });

        test('GIVEN josh w/ data THEN returns data', async () => {
          await josh[Method.Set]('test:partition', 'value');

          const parted = await josh[Method.Partition]((value) => value === 'value');

          expect(parted).toEqual([{ 'test:partition': 'value' }, {}]);
        });

        test('GIVEN josh w/ data THEN returns data', async () => {
          await josh[Method.Set]('test:partition', 'value');

          const parted = await josh[Method.Partition]((value) => value !== 'value');

          expect(parted).toEqual([{}, { 'test:partition': 'value' }]);
        });
      });

      describe(Payload.Type.Value, () => {
        test('GIVEN josh w/o data THEN returns data w/o data', async () => {
          const parted = await josh[Method.Partition]([], 'value');

          expect(parted).toEqual([{}, {}]);
        });

        test('GIVEN josh w/ data THEN returns data', async () => {
          await josh[Method.Set]('test:partition', 'value');

          const parted = await josh[Method.Partition]([], 'value');

          expect(parted).toEqual([{ 'test:partition': 'value' }, {}]);
        });

        test('GIVEN josh w/ data THEN returns data', async () => {
          await josh[Method.Set]('test:partition', 'value');

          const parted = await josh[Method.Partition]([], 'anotherValue');

          expect(parted).toEqual([{}, { 'test:partition': 'value' }]);
        });
      });
    });

    describe(Method.Push, () => {
      test('GIVEN josh w/ array at key THEN returns data AND pushes value to array at key', async () => {
        await josh[Method.Set]('test:push', []);

        const pushed = await josh[Method.Push]('test:push', 'value');

        expect(pushed).toBeInstanceOf(Josh);

        const value = await josh[Method.Get]('test:push');

        expect(value).toEqual(['value']);
      });

      test('GIVEN josh w/ array at path THEN returns data AND pushes value to array at path', async () => {
        await josh[Method.Set]('test:push', { path: [] });

        const pushed = await josh[Method.Push]('test:push', 'value', 'path');

        expect(pushed).toBeInstanceOf(Josh);

        const value = await josh[Method.Get]<{ path: string[] }>('test:push');

        expect(value ? value.path : []).toEqual(['value']);
      });
    });

    describe(Method.Random, () => {
      test('GIVEN josh w/ data THEN returns data from random', async () => {
        await josh[Method.Set]('test:random', 'value');

        const random = await josh[Method.Random]();

        expect(random).toEqual(['value']);
      });

      test('GIVEN josh w/o data THEN throw provider error', async () => {
        const random = josh[Method.Random]();

        await expect(random).rejects.toThrowError('The provider failed to return data.');
      });

      test('GIVEN josh w/ data THEN returns data from random', async () => {
        await josh[Method.Set]('test:random', 'value');

        const random = await josh[Method.Random]({ count: 1, duplicates: false });

        expect(random).toEqual(['value']);
      });

      test('GIVEN josh w/ data THEN returns multiple data from random', async () => {
        await josh[Method.Set]('test:random', 'value');
        await josh[Method.Set]('test:random2', 'value');

        const random = await josh[Method.Random]({ count: 2, duplicates: false });

        expect(random).toEqual(['value', 'value']);
      });

      test('GIVEN josh w/ data w/ duplicates THEN returns multiple data from random', async () => {
        await josh[Method.Set]('test:random', 'value');
        await josh[Method.Set]('test:random2', 'value');

        const random = await josh[Method.Random]({ count: 2, duplicates: true });

        expect(random).toEqual(['value', 'value']);
      });
    });

    describe(Method.RandomKey, () => {
      test('GIVEN josh w/ data THEN returns data from randomKey', async () => {
        await josh[Method.Set]('test:randomKey', 'value');

        const random = await josh[Method.RandomKey]();

        expect(random).toEqual(['test:randomKey']);
      });

      test('GIVEN josh w/o data THEN throw provider error', async () => {
        const random = josh[Method.RandomKey]();

        await expect(random).rejects.toThrowError('The provider failed to return data.');
      });

      test('GIVEN josh w/ data THEN returns data from random', async () => {
        await josh[Method.Set]('test:randomKey', 'value');

        const random = await josh[Method.RandomKey]({ count: 1, duplicates: false });

        expect(random).toEqual(['test:randomKey']);
      });

      test('GIVEN josh w/ data THEN returns multiple data from random', async () => {
        await josh[Method.Set]('test:randomKey', 'value');
        await josh[Method.Set]('test:randomKey2', 'value');

        const random = await josh[Method.RandomKey]({ count: 2, duplicates: false });

        expect(random?.length).toEqual(2);
      });

      test('GIVEN josh w/ data w/ duplicates THEN returns multiple data from random', async () => {
        await josh[Method.Set]('test:randomKey', 'value');
        await josh[Method.Set]('test:randomKey2', 'value');

        const random = await josh[Method.RandomKey]({ count: 2, duplicates: true });

        expect(random?.length).toEqual(2);
      });
    });

    describe(Method.Remove, () => {
      test('GIVEN josh w/ data w/ invalid primitive THEN rejects', async () => {
        const result = josh[Method.Remove]('path', null);

        await expect(result).rejects.toBeInstanceOf(JoshError);
      });

      describe(Payload.Type.Hook, () => {
        test('GIVEN josh w/ array at key THEN returns data AND removes value from array at key', async () => {
          await josh[Method.Set]('test:remove', ['value']);

          const getBefore = await josh[Method.Get]('test:remove');

          expect(getBefore).toEqual(['value']);

          const result = await josh[Method.Remove]('test:remove', (value: string) => value === 'value', []);

          expect(result).toBeInstanceOf(Josh);

          const getAfter = await josh[Method.Get]('test:remove');

          expect(getAfter).toEqual([]);
        });
      });

      describe(Payload.Type.Value, () => {
        test('GIVEN josh w/ array at key THEN returns data AND removes value from array at key', async () => {
          await josh[Method.Set]('test:remove', ['value']);

          const getBefore = await josh[Method.Get]('test:remove');

          expect(getBefore).toEqual(['value']);

          const result = await josh[Method.Remove]('test:remove', 'value', []);

          expect(result).toBeInstanceOf(Josh);

          const getAfter = await josh[Method.Get]('test:remove');

          expect(getAfter).toEqual([]);
        });
      });
    });

    describe(Method.Set, () => {
      test('GIVEN josh w/o data THEN returns data AND sets value at key', async () => {
        const hasBefore = await josh[Method.Has]('test:set');

        expect(hasBefore).toBe(false);

        const result = await josh[Method.Set]('test:set', 'value');

        expect(result).toBeInstanceOf(Josh);

        const hasAfter = await josh[Method.Has]('test:set');

        expect(hasAfter).toBe(true);
      });

      test('GIVEN josh w/o data THEN returns data AND sets value at key and path', async () => {
        const hasBefore = await josh[Method.Has]('test:set', ['path']);

        expect(hasBefore).toBe(false);

        const result = await josh[Method.Set]('test:set', 'value', 'path');

        expect(result).toBeInstanceOf(Josh);

        const hasAfter = await josh[Method.Has]('test:set', ['path']);

        expect(hasAfter).toBe(true);
      });
    });

    describe(Method.SetMany, () => {
      test('GIVEN josh w/o data THEN returns data AND sets value at key', async () => {
        const hasBefore = await josh[Method.Has]('test:setMany');

        expect(hasBefore).toBe(false);

        const result = await josh[Method.SetMany]([
          [{ key: 'test:setMany', path: [] }, 'value'],
          [{ key: 'test:setMany2' }, 'value']
        ]);

        expect(result).toBeInstanceOf(Josh);

        const entries = await josh[Method.Entries]();

        expect(entries).toEqual({ 'test:setMany': 'value', 'test:setMany2': 'value' });
      });

      test('GIVEN josh w/ data THEN returns data AND does not set value at key', async () => {
        await josh[Method.Set]('test:setMany', 'value');

        const result = await josh[Method.SetMany]([[{ key: 'test:setMany', path: [] }, 'value-overwritten']], false);

        expect(result).toBeInstanceOf(Josh);

        const entries = await josh[Method.Entries]();

        expect(entries).toEqual({ 'test:setMany': 'value' });
      });
    });

    describe(Method.Size, () => {
      test('GIVEN josh w/o data THEN returns 0', async () => {
        const result = await josh[Method.Size]();

        expect(result).toBe(0);
      });

      test('GIVEN josh w/ data THEN returns 1)', async () => {
        await josh[Method.Set]('test:size', 'value');

        const result = await josh[Method.Size]();

        expect(result).toBe(1);
      });
    });

    describe(Method.Some, () => {
      describe(Payload.Type.Hook, () => {
        test('GIVEN josh w/o data THEN returns false', async () => {
          const result = await josh[Method.Some]((value) => value === 'value');

          expect(result).toBe(false);
        });

        test('GIVEN josh w/ data w/o value THEN rejects', async () => {
          const result = josh[Method.Some]('path', undefined);

          await expect(result).rejects.toBeInstanceOf(JoshError);
        });

        test('GIVEN josh w/ data w/ invalid primitive THEN rejects', async () => {
          const result = josh[Method.Some]('path', null);

          await expect(result).rejects.toBeInstanceOf(JoshError);
        });

        test('GIVEN josh w/ data THEN returns true', async () => {
          await josh[Method.Set]('test:some', { path: 'value' });

          const result = await josh[Method.Some](['path'], 'value');

          expect(result).toBe(true);
        });
      });

      describe(Payload.Type.Value, () => {
        test('GIVEN josh w/o data THEN returns false', async () => {
          const result = await josh[Method.Some]((value) => value === 'value');

          expect(result).toBe(false);
        });

        test('GIVEN josh w/ data THEN returns true', async () => {
          await josh[Method.Set]('test:some', 'value');

          try {
            const result = await josh[Method.Some]([], 'value');

            expect(result).toBe(true);
          } catch (err) {
            console.log(err);
          }
        });
      });
    });

    describe(Method.Update, () => {
      test('GIVEN josh w/ data at key THEN returns data AND updates value at key', async () => {
        await josh[Method.Set]('test:update', 'value');

        const result = await josh[Method.Update]('test:update', (value) => value);

        expect(result).toBeInstanceOf(Josh);
      });

      test('GIVEN josh w/ data at path THEN returns data AND updates value at path', async () => {
        await josh[Method.Set]('test:update', 'value', 'path');

        const result = await josh[Method.Update]('test:update', (value) => value);

        expect(result).toBeInstanceOf(Josh);
      });
    });

    describe(Method.Values, () => {
      test('GIVEN josh w/o data THEN returns data w/o data', async () => {
        const result = await josh[Method.Values]();

        expect(result).toEqual([]);
      });

      test('GIVEN josh w/ data THEN returns data', async () => {
        await josh[Method.Set]('test:values', 'value');

        const result = await josh[Method.Values]();

        expect(result).toEqual(['value']);
      });
    });

    describe(Method.Each, () => {
      test('GIVEN josh w/o data THEN loops 0 times', async () => {
        const mockCallback = jest.fn(() => true);
        const result = await josh[Method.Each](mockCallback);

        expect(result).toBeInstanceOf(Josh);
        expect(mockCallback.mock.calls.length).toBe(0);
      });

      test('GIVEN josh w/ data THEN loops x times THEN clears', async () => {
        const mockCallback = jest.fn(() => true);

        await josh[Method.Set]('test:each1', 'value1');
        await josh[Method.Set]('test:each2', 'value2');
        await josh[Method.Set]('test:each3', 'value3');

        const result = await josh[Method.Each](mockCallback);

        expect(result).toBeInstanceOf(Josh);
        expect(mockCallback.mock.calls.length).toBe(3);
        expect(mockCallback.mock.calls).toContainEqual(['value1', 'test:each1']);
        expect(mockCallback.mock.calls).toContainEqual(['value2', 'test:each2']);
        expect(mockCallback.mock.calls).toContainEqual(['value3', 'test:each3']);
      });
    });

    describe('import', () => {
      test('GIVEN josh w/ data THEN exports data THEN imports', async () => {
        await josh[Method.Set]('test:import', 'value');

        const json = await josh.export();

        await josh.import({ json, clear: true, overwrite: true });

        const result = await josh[Method.Entries]();
        expect(result).toEqual({ 'test:import': 'value' });
      });

      test('GIVEN josh w/ data THEN exports data THEN imports', async () => {
        await josh[Method.Set]('test:import', 'not-value');

        const json = await josh.export();

        await josh[Method.Set]('test:import', 'real-value');

        await josh.import({ json, overwrite: false });

        const result = await josh[Method.Entries]();
        expect(result).toEqual({ 'test:import': 'real-value' });
      });

      test('GIVEN fake legacy data THEN imports and converts', async () => {
        const legacy = {
          name: 'test',
          version: '1.0.0',
          exportDate: Date.now(),
          keys: [{ key: 'foo', value: 'bar' }]
        };

        await josh.import({ json: legacy });

        const result = await josh[Method.Entries]();
        expect(result).toEqual({ foo: 'bar' });
      });
    });

    describe('export', () => {
      test('GIVEN josh w/ data THEN exports data', async () => {
        await josh[Method.Set]('test:export', 'value');

        const exported = await josh.export();

        expect(exported.entries).toEqual([['test:export', 'value']]);
        expect(exported.exportedTimestamp).toBeGreaterThan(0);
        expect(exported.name).toBe('test');
      });
    });

    describe('multi', () => {
      test("GIVEN josh w/ data THEN multi's data", async () => {
        const result = await Josh.multi(['foo', 'bar']);

        expect(result.foo).toBeInstanceOf(Josh);
        expect(result.bar).toBeInstanceOf(Josh);

        expect(result.foo.name).toBe('foo');
        expect(result.bar.name).toBe('bar');
      });
    });
  });
});
