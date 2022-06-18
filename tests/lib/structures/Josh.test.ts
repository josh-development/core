import { Method, Payload } from '@joshdb/middleware';
import { Bulk, Josh } from '../../../src';

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
      test('GIVEN ... THEN returns payload w/ generated key as data AND increments autoKeyCount', async () => {
        const data = await josh[Method.AutoKey]();

        expect(typeof data).toBe('string');
      });

      test('each value of autoKey should be unique', async () => {
        const arr = await Promise.all([...Array(10)].map(async () => await josh[Method.AutoKey]()));
        const isUnique = new Set(arr).size === arr.length;

        expect(isUnique).toBe(true);
      });
    });

    describe(Method.Clear, () => {
      test('GIVEN provider w/o data THEN provider data cleared', async () => {
        const sizeBefore = await josh[Method.Size]();

        expect(sizeBefore).toBe(0);

        const cleared = await josh[Method.Clear]();

        expect(cleared).toBeInstanceOf(Josh);

        const sizeAfter = await josh[Method.Size]();

        expect(sizeAfter).toBe(0);
      });

      test('GIVEN provider w/ data THEN provider data cleared', async () => {
        await josh[Method.Set]('test:clear', 'value');

        const sizeBefore = await josh[Method.Size]();

        expect(sizeBefore).toBe(1);

        const cleared = await josh[Method.Clear]();

        expect(cleared).toBeInstanceOf(Josh);

        const sizeAfter = await josh[Method.Size]();

        expect(sizeAfter).toBe(0);
      });
    });

    describe(Method.Dec, () => {
      test('GIVEN provider w/ number at key THEN decremented number at key', async () => {
        await josh[Method.Set]('test:dec', 1);

        const deced = await josh[Method.Dec]('test:dec');

        expect(deced).toBeInstanceOf(Josh);

        const value = await josh[Method.Get]('test:dec');

        expect(value).toBe(0);
      });

      test('GIVEN provider w/ number at path THEN decremented number at path', async () => {
        await josh[Method.Set]('test:dec', 1, ['path']);

        const deced = await josh[Method.Dec]('test:dec', ['path']);

        expect(deced).toBeInstanceOf(Josh);

        const value = await josh[Method.Get]('test:dec', ['path']);

        expect(value).toBe(0);
      });
    });

    describe(Method.Delete, () => {
      test('GIVEN provider w/ value at key THEN deletes value at key', async () => {
        await josh[Method.Set]('test:delete', 'value');

        const hasBefore = await josh[Method.Has]('test:delete');

        expect(hasBefore).toBe(true);

        const deleted = await josh[Method.Delete]('test:delete');

        expect(deleted).toBeInstanceOf(Josh);

        const hasAfter = await josh[Method.Has]('test:delete');

        expect(hasAfter).toBe(false);
      });

      test('GIVEN provider w/ value at path THEN deletes value at path', async () => {
        await josh[Method.Set]('test:delete', 'value');

        const hasBefore = await josh[Method.Has]('test:delete');

        expect(hasBefore).toBe(true);

        const deleted = await josh[Method.Delete]('test:delete', ['path']);

        expect(deleted).toBeInstanceOf(Josh);

        const hasAfter = await josh[Method.Has]('test:delete', ['path']);

        expect(hasAfter).toBe(false);
      });

      test('GIVEN provider w/ value at nested path THEN deletes value at nested path', async () => {
        await josh[Method.Set]('test:delete', 'value', ['path', 'nested']);

        const hasBefore = await josh[Method.Has]('test:delete', ['path', 'nested']);

        expect(hasBefore).toBe(true);

        const deleted = await josh[Method.Delete]('test:delete', ['path', 'nested']);

        expect(deleted).toBeInstanceOf(Josh);

        const hasAfter = await josh[Method.Has]('test:delete', ['path', 'nested']);

        expect(hasAfter).toBe(false);
      });
    });

    describe(Method.Ensure, () => {
      test('GIVEN provider w/o data at key THEN returns payload w/ data as defaultValue AND sets default value at key', async () => {
        const sizeBefore = await josh[Method.Size]();

        expect(sizeBefore).toBe(0);

        const ensured = await josh[Method.Ensure]('test:ensure', 'defaultValue');

        expect(ensured).toBe('defaultValue');

        const sizeAfter = await josh[Method.Size]();

        expect(sizeAfter).toBe(1);
      });

      test('GIVEN provider w/ value at key THEN returns payload w/ data as value at key', async () => {
        await josh[Method.Set]('test:ensure', 'value');

        const ensured = await josh[Method.Ensure]('test:ensure', 'defaultValue');

        expect(ensured).toBe('value');
      });
    });

    describe(Method.Entries, () => {
      test('GIVEN provider w/o data THEN returns payload w/o data', async () => {
        const entries = await josh[Method.Entries]();

        expect(entries).toEqual({});
      });

      test('GIVEN provider w/ data THEN returns payload w/ data as Bulk.Object', async () => {
        await josh[Method.Set]('test:entries', 'value');

        const entries = await josh.entries();

        expect(entries).toEqual({ 'test:entries': 'value' });
      });

      test('GIVEN provider w/ data THEN returns payload w/ data as Bulk.Map', async () => {
        await josh[Method.Set]('test:entries', 'value');

        const entries = await josh[Method.Entries](Bulk.Map);

        expect(entries).toBeInstanceOf(Map);
        expect(Array.from(entries.entries())).toEqual([['test:entries', 'value']]);
      });

      test('GIVEN provider w/ data THEN returns payload w/ data as Bulk.OneDimensionalArray', async () => {
        await josh[Method.Set]('test:entries', 'value');

        const entries = await josh[Method.Entries](Bulk.OneDimensionalArray);

        expect(entries).toBeInstanceOf(Array);
        expect(entries).toEqual(['value']);
      });

      test('GIVEN provider w/ data THEN returns payload w/ data as Bulk.TwoDimensionalArray', async () => {
        await josh[Method.Set]('test:entries', 'value');

        const entries = await josh[Method.Entries](Bulk.TwoDimensionalArray);

        expect(entries).toBeInstanceOf(Array);
        expect(entries).toEqual([['test:entries', 'value']]);
      });
    });

    describe(Method.Every, () => {
      describe(Payload.Type.Hook, () => {
        test('GIVEN provider w/o data THEN returns true', async () => {
          const everyed = await josh[Method.Every]((value) => value === 'value');

          expect(everyed).toBe(true);
        });

        test('GIVEN provider w/ data THEN returns true', async () => {
          await josh[Method.SetMany]([
            ['firstKey', 'value'],
            ['secondKey', 'value']
          ]);

          const everyed = await josh[Method.Every]((value) => value === 'value');
          expect(everyed).toBe(true);
        });

        test('GIVEN provider w/ unique data THEN returns false', async () => {
          await josh[Method.SetMany]([
            ['firstKey', 'value'],
            ['secondKey', 'not value']
          ]);

          const everyed = await josh[Method.Every]((value) => value === 'value');
          expect(everyed).toBe(false);
        });
      });

      describe(Payload.Type.Value, () => {
        test('GIVEN provider w/o data THEN returns true', async () => {
          const everyed = await josh[Method.Every]('path', 'value');

          expect(everyed).toBe(true);
        });

        // test('GIVEN provider w/ data THEN returns true', async () => {
        //   await josh[Method.SetMany]([
        //     ['firstKey', 'value'],
        //     ['secondKey', 'value']
        //   ]);

        //   const everyed = await josh[Method.Every]([], 'value');

        //   expect(everyed).toBe(true);
        // });

        // test('GIVEN provider w/ unique data THEN returns false', async () => {
        //   await josh[Method.SetMany]([
        //     ['firstKey', 'value'],
        //     ['secondKey', 'not value']
        //   ]);

        //   const everyed = await josh[Method.Every]([], 'value');
        //   expect(everyed).toBe(false);
        // });

        // Why ^? Seems that every using Value doesn't play nice

        // TODO: rest of these tests - dan
      });
    });

    describe(Method.Filter, () => {
      describe(Payload.Type.Hook, () => {
        test('GIVEN provider w/o data THEN returns payload w/o data from filter', async () => {
          const filtered = await josh[Method.Filter]((value) => value === 'value');

          expect(filtered).toEqual({});
        });

        test('GIVEN provider w/ data THEN returns payload w/ data from filter', async () => {
          await josh[Method.Set]('test:filter', 'value');

          const filtered = await josh[Method.Filter]((value) => value === 'value');

          expect(filtered).toEqual({ 'test:filter': 'value' });
        });
      });

      describe(Payload.Type.Value, () => {
        test('GIVEN provider w/o data THEN returns payload w/o data from filter', async () => {
          const filtered = await josh[Method.Filter]('path', 'value');

          expect(filtered).toEqual({});
        });

        test('GIVEN provider w/ data THEN returns payload w/ data from filter', async () => {
          await josh[Method.Set]('test:filter', 'value', 'path');

          const filtered = await josh[Method.Filter]('path', 'value');

          expect(filtered).toEqual({ 'test:filter': { path: 'value' } });
        });
      });
    });

    describe(Method.Find, () => {
      describe(Payload.Type.Hook, () => {
        test('GIVEN provider w/o data THEN returns payload w/o data from find', async () => {
          const found = await josh[Method.Find]((value) => value === 'value');

          expect(found).toEqual([null, null]);
        });

        test('GIVEN provider w/ data THEN returns payload w/ data from find', async () => {
          await josh[Method.Set]('test:find', 'value');

          const found = await josh[Method.Find]((value) => value === 'value');

          expect(found).toEqual(['test:find', 'value']);
        });
      });

      describe(Payload.Type.Value, () => {
        test('GIVEN provider w/o data THEN returns payload w/o data from find', async () => {
          const found = await josh[Method.Find]('path', 'value');

          expect(found).toEqual([null, null]);
        });

        test('GIVEN provider w/ data THEN returns payload w/o data from find', async () => {
          await josh[Method.Set]('test:find', 'value', 'path');

          const found = await josh[Method.Find]('path', 'value');

          expect(found).toEqual(['test:find', { path: 'value' }]);
        });
      });
    });

    describe(Method.Get, () => {
      test('GIVEN provider w/o data THEN returns payload w/o data from get', async () => {
        const got = await josh[Method.Get]('test:get');

        expect(got).toBeNull();
      });

      test('GIVEN provider w/ value at key THEN returns payload w/ data from get at key', async () => {
        await josh[Method.Set]('test:get', 'value');

        const got = await josh[Method.Get]('test:get');

        expect(got).toBe('value');
      });

      test('GIVEN provider w/ value at path THEN returns payload w/ data from get at path', async () => {
        await josh[Method.Set]('test:get', 'value', 'path');

        const got = await josh[Method.Get]('test:get', 'path');

        expect(got).toBe('value');
      });
    });

    /*

      

      describe(Method.GetMany, () => {
        test('GIVEN provider w/o data THEN returns payload w/o data from getMany', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:getMany', path: [], value: null });

          const payload = await josh[Method.GetMany]({ method: Method.GetMany, keys: ['test:getMany'] });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, keys, data } = payload;

          expect(method).toBe(Method.GetMany);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(keys).toEqual(['test:getMany']);
          expect(data).toEqual({ 'test:getMany': null });
        });

        test('GIVEN provider w/ data THEN returns payload w/ data from getMany', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:getMany', path: [], value: 'value' });

          const payload = await josh[Method.GetMany]({ method: Method.GetMany, keys: ['test:getMany'] });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, keys, data } = payload;

          expect(method).toBe(Method.GetMany);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(keys).toEqual(['test:getMany']);
          expect(data).toEqual({ 'test:getMany': 'value' });
        });
      });

      describe(Method.Has, () => {
        test('GIVEN provider w/o data at key THEN returns false', async () => {
          const payload = await josh[Method.Has]({ method: Method.Has, key: 'test:has', path: [] });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path, data } = payload;

          expect(method).toBe(Method.Has);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(key).toBe('test:has');
          expect(path).toEqual([]);
          expect(data).toBe(false);
        });

        test('GIVEN provider w/o data at path THEN returns false', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:has', path: [], value: 'value' });

          const payload = await josh[Method.Has]({ method: Method.Has, key: 'test:has', path: ['path'] });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path, data } = payload;

          expect(method).toBe(Method.Has);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(key).toBe('test:has');
          expect(path).toEqual(['path']);
          expect(data).toBe(false);
        });

        test('GIVEN provider w/ data at key THEN returns true', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:has', path: [], value: 'value' });

          const payload = await josh[Method.Has]({ method: Method.Has, key: 'test:has', path: [] });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path, data } = payload;

          expect(method).toBe(Method.Has);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(key).toBe('test:has');
          expect(path).toEqual([]);
          expect(data).toBe(true);
        });

        test('GIVEN provider w/ data at path THEN returns true', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:has', path: 'path', value: 'value' });

          const payload = await josh[Method.Has]({ method: Method.Has, key: 'test:has', path: ['path'] });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path, data } = payload;

          expect(method).toBe(Method.Has);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(key).toBe('test:has');
          expect(path).toEqual(['path']);
          expect(data).toBe(true);
        });
      });

      describe(Method.Inc, () => {
        test('GIVEN provider w/o data at key THEN returns payload w/ missing data error', async () => {
          const payload = await josh[Method.Inc]({ method: Method.Inc, key: 'test:inc', path: [] });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path } = payload;

          expect(method).toBe(Method.Inc);
          expect(trigger).toBeUndefined();
          expect(error).toBeInstanceOf(Error);
          expect(error?.identifier).toBe(CommonIdentifiers.MissingData);
          expect(key).toBe('test:inc');
          expect(path).toEqual([]);
        });

        test('GIVEN provider w/o data at path THEN returns payload w/ missing data error', async () => {
          const payload = await josh[Method.Inc]({ method: Method.Inc, key: 'test:inc', path: ['path'] });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path } = payload;

          expect(method).toBe(Method.Inc);
          expect(trigger).toBeUndefined();
          expect(error).toBeInstanceOf(Error);
          expect(error?.identifier).toBe(CommonIdentifiers.MissingData);
          expect(key).toBe('test:inc');
          expect(path).toEqual(['path']);
        });

        test('GIVEN provider w/ invalid type at key THEN returns payload w/ invalid type error', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:inc', path: [], value: 'value' });

          const payload = await josh[Method.Inc]({ method: Method.Inc, key: 'test:inc', path: [] });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path } = payload;

          expect(method).toBe(Method.Inc);
          expect(trigger).toBeUndefined();
          expect(error).toBeInstanceOf(Error);
          expect(error?.identifier).toBe(CommonIdentifiers.InvalidDataType);
          expect(key).toBe('test:inc');
          expect(path).toEqual([]);
        });

        test('GIVEN provider w/ invalid type at path THEN returns payload w/ invalid type error', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:inc', path: 'path', value: 'value' });

          const payload = await josh[Method.Inc]({ method: Method.Inc, key: 'test:inc', path: ['path'] });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path } = payload;

          expect(method).toBe(Method.Inc);
          expect(trigger).toBeUndefined();
          expect(error).toBeInstanceOf(Error);
          expect(error?.identifier).toBe(CommonIdentifiers.InvalidDataType);
          expect(key).toBe('test:inc');
          expect(path).toEqual(['path']);
        });

        test('GIVEN provider w/ number at key THEN incremented number at key', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:inc', path: [], value: 0 });

          const payload = await josh[Method.Inc]({ method: Method.Inc, key: 'test:inc', path: [] });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path } = payload;

          expect(method).toBe(Method.Inc);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(key).toBe('test:inc');
          expect(path).toEqual([]);
        });

        test('GIVEN provider w/ number at path THEN incremented number at key and path', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:inc', path: 'path', value: 0 });

          const payload = await josh[Method.Inc]({ method: Method.Inc, key: 'test:inc', path: ['path'] });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path } = payload;

          expect(method).toBe(Method.Inc);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(key).toBe('test:inc');
          expect(path).toEqual(['path']);
        });
      });

      describe(Method.Keys, () => {
        test('GIVEN provider w/o data THEN returns payload w/o data from keys', async () => {
          const payload = await josh[Method.Keys]({ method: Method.Keys });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, data } = payload;

          expect(method).toBe(Method.Keys);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(data).toEqual([]);
        });

        test('GIVEN provider w/ data THEN returns payload w/ data from keys', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:keys', path: [], value: 'value' });

          const payload = await josh[Method.Keys]({ method: Method.Keys });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, data } = payload;

          expect(method).toBe(Method.Keys);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(data).toEqual(['test:keys']);
        });
      });

      describe(Method.Map, () => {
        describe(Payload.Type.Hook, () => {
          test('GIVEN provider w/o data THEN returns payload w/o data from map', async () => {
            const payload = await josh[Method.Map]({ method: Method.Map, type: Payload.Type.Hook, hook: (value) => value });

            expect(typeof payload).toBe('object');

            const { method, trigger, error, hook, data } = payload;

            expect(method).toBe(Method.Map);
            expect(trigger).toBeUndefined();
            expect(error).toBeUndefined();
            expect(typeof hook).toBe('function');
            expect(data).toEqual([]);
          });

          test('GIVEN provider w/ data THEN returns payload w/ data from map', async () => {
            await josh[Method.Set]({ method: Method.Set, key: 'test:map', path: [], value: 'value' });

            const payload = await josh[Method.Map]({ method: Method.Map, type: Payload.Type.Hook, hook: (value) => value });

            expect(typeof payload).toBe('object');

            const { method, trigger, error, hook, data } = payload;

            expect(method).toBe(Method.Map);
            expect(trigger).toBeUndefined();
            expect(error).toBeUndefined();
            expect(typeof hook).toBe('function');
            expect(data).toEqual(['value']);
          });
        });

        describe(Payload.Type.Path, () => {
          test('GIVEN provider w/o data THEN returns payload w/o data from map', async () => {
            const payload = await josh[Method.Map]({ method: Method.Map, type: Payload.Type.Path, path: [] });

            expect(typeof payload).toBe('object');

            const { method, trigger, error, path, data } = payload;

            expect(method).toBe(Method.Map);
            expect(trigger).toBeUndefined();
            expect(error).toBeUndefined();
            expect(path).toEqual([]);
            expect(data).toEqual([]);
          });

          test('GIVEN provider w/ data THEN returns payload w/ data from map', async () => {
            await josh[Method.Set]({ method: Method.Set, key: 'test:map', path: [], value: 'value' });

            const payload = await josh[Method.Map]({ method: Method.Map, type: Payload.Type.Path, path: [] });

            expect(typeof payload).toBe('object');

            const { method, trigger, error, path, data } = payload;

            expect(method).toBe(Method.Map);
            expect(trigger).toBeUndefined();
            expect(error).toBeUndefined();
            expect(path).toEqual([]);
            expect(data).toEqual(['value']);
          });

          test('GIVEN provider w/ data at path THEN returns payload w/ data from map', async () => {
            await josh[Method.Set]({ method: Method.Set, key: 'test:map', path: 'path', value: 'value' });

            const payload = await josh[Method.Map]({ method: Method.Map, type: Payload.Type.Path, path: ['path'] });

            expect(typeof payload).toBe('object');

            const { method, trigger, error, path, data } = payload;

            expect(method).toBe(Method.Map);
            expect(trigger).toBeUndefined();
            expect(error).toBeUndefined();
            expect(path).toEqual(['path']);
            expect(data).toEqual(['value']);
          });
        });
      });

      describe(Method.Math, () => {
        test('GIVEN provider w/o data THEN returns payload w/ error', async () => {
          const payload = await josh[Method.Math]({
            method: Method.Math,
            key: 'test:math',
            path: [],
            operator: MathOperator.Addition,
            operand: 1
          });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path, operator, operand } = payload;

          expect(method).toBe(Method.Math);
          expect(trigger).toBeUndefined();
          expect(error).toBeInstanceOf(Error);
          expect(error?.identifier).toBe(CommonIdentifiers.MissingData);
          expect(key).toBe('test:math');
          expect(path).toEqual([]);
          expect(operator).toBe(MathOperator.Addition);
          expect(operand).toBe(1);
        });

        test('GIVEN provider w/o data at path THEN returns payload w/ error', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:math', path: [], value: 0 });

          const payload = await josh[Method.Math]({
            method: Method.Math,
            key: 'test:math',
            path: 'path',
            operator: MathOperator.Addition,
            operand: 1
          });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path, operator, operand } = payload;

          expect(method).toBe(Method.Math);
          expect(trigger).toBeUndefined();
          expect(error).toBeInstanceOf(Error);
          expect(error?.identifier).toBe(CommonIdentifiers.MissingData);
          expect(key).toBe('test:math');
          expect(path).toEqual(['path']);
          expect(operator).toBe(MathOperator.Addition);
          expect(operand).toBe(1);
        });

        test('GIVEN provider w/ invalid type at key THEN returns payload w/ error', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:math', path: [], value: 'value' });

          const payload = await josh[Method.Math]({
            method: Method.Math,
            key: 'test:math',
            path: [],
            operator: MathOperator.Addition,
            operand: 1
          });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path, operator, operand } = payload;

          expect(method).toBe(Method.Math);
          expect(trigger).toBeUndefined();
          expect(error).toBeInstanceOf(Error);
          expect(error?.identifier).toBe(CommonIdentifiers.InvalidDataType);
          expect(key).toBe('test:math');
          expect(path).toEqual([]);
          expect(operator).toBe(MathOperator.Addition);
          expect(operand).toBe(1);
        });

        test('GIVEN provider w/ invalid type at path THEN returns payload w/ error', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:math', path: 'path', value: 'value' });

          const payload = await josh[Method.Math]({
            method: Method.Math,
            key: 'test:math',
            path: 'path',
            operator: MathOperator.Addition,
            operand: 1
          });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path, operator, operand } = payload;

          expect(method).toBe(Method.Math);
          expect(trigger).toBeUndefined();
          expect(error).toBeInstanceOf(Error);
          expect(error?.identifier).toBe(CommonIdentifiers.InvalidDataType);
          expect(key).toBe('test:math');
          expect(path).toEqual(['path']);
          expect(operator).toBe(MathOperator.Addition);
          expect(operand).toBe(1);
        });
      });

      describe(Method.Partition, () => {
        describe(Payload.Type.Hook, () => {
          test('GIVEN provider w/o data THEN returns payload w/o data', async () => {
            const payload = await josh[Method.Partition]({
              method: Method.Partition,
              type: Payload.Type.Hook,
              hook: (value) => value === 'value'
            });

            expect(typeof payload).toBe('object');

            const { method, trigger, error, type, hook, data } = payload;

            expect(method).toBe(Method.Partition);
            expect(trigger).toBeUndefined();
            expect(error).toBeUndefined();
            expect(type).toBe(Payload.Type.Hook);
            expect(typeof hook).toBe('function');
            expect(data?.truthy).toEqual({});
            expect(data?.falsy).toEqual({});
          });

          test('GIVEN provider w/ data THEN returns payload w/ data', async () => {
            await josh[Method.Set]({ method: Method.Set, key: 'test:partition', path: [], value: 'value' });

            const payload = await josh[Method.Partition]({
              method: Method.Partition,
              type: Payload.Type.Hook,
              hook: (value) => value === 'value'
            });

            expect(typeof payload).toBe('object');

            const { method, trigger, error, type, hook, data } = payload;

            expect(method).toBe(Method.Partition);
            expect(trigger).toBeUndefined();
            expect(error).toBeUndefined();
            expect(type).toBe(Payload.Type.Hook);
            expect(typeof hook).toBe('function');
            expect(data?.truthy).toEqual({ 'test:partition': 'value' });
            expect(data?.falsy).toEqual({});
          });

          test('GIVEN provider w/ data THEN returns payload w/ data', async () => {
            await josh[Method.Set]({ method: Method.Set, key: 'test:partition', path: [], value: 'value' });

            const payload = await josh[Method.Partition]({
              method: Method.Partition,
              type: Payload.Type.Hook,
              hook: (value) => value !== 'value'
            });

            expect(typeof payload).toBe('object');

            const { method, trigger, error, type, hook, data } = payload;

            expect(method).toBe(Method.Partition);
            expect(trigger).toBeUndefined();
            expect(error).toBeUndefined();
            expect(type).toBe(Payload.Type.Hook);
            expect(typeof hook).toBe('function');
            expect(data?.truthy).toEqual({});
            expect(data?.falsy).toEqual({ 'test:partition': 'value' });
          });
        });

        describe(Payload.Type.Value, () => {
          test('GIVEN provider w/o data THEN returns payload w/o data', async () => {
            const payload = await josh[Method.Partition]({
              method: Method.Partition,
              type: Payload.Type.Value,
              path: [],
              value: 'value'
            });

            expect(typeof payload).toBe('object');

            const { method, trigger, error, type, path, value, data } = payload;

            expect(method).toBe(Method.Partition);
            expect(trigger).toBeUndefined();
            expect(error).toBeUndefined();
            expect(type).toBe(Payload.Type.Value);
            expect(path).toEqual([]);
            expect(value).toBe('value');
            expect(data?.truthy).toEqual({});
            expect(data?.falsy).toEqual({});
          });

          test('GIVEN provider w/ data THEN returns payload w/ data', async () => {
            await josh[Method.Set]({ method: Method.Set, key: 'test:partition', path: [], value: 'value' });

            const payload = await josh[Method.Partition]({
              method: Method.Partition,
              type: Payload.Type.Value,
              path: [],
              value: 'value'
            });

            expect(typeof payload).toBe('object');

            const { method, trigger, error, type, path, value, data } = payload;

            expect(method).toBe(Method.Partition);
            expect(trigger).toBeUndefined();
            expect(error).toBeUndefined();
            expect(type).toBe(Payload.Type.Value);
            expect(path).toEqual([]);
            expect(value).toBe('value');
            expect(data?.truthy).toEqual({ 'test:partition': 'value' });
            expect(data?.falsy).toEqual({});
          });

          test('GIVEN provider w/ data THEN returns payload w/ data', async () => {
            await josh[Method.Set]({ method: Method.Set, key: 'test:partition', path: [], value: 'value' });

            const payload = await josh[Method.Partition]({
              method: Method.Partition,
              type: Payload.Type.Value,
              path: [],
              value: 'anotherValue'
            });

            expect(typeof payload).toBe('object');

            const { method, trigger, error, type, path, value, data } = payload;

            expect(method).toBe(Method.Partition);
            expect(trigger).toBeUndefined();
            expect(error).toBeUndefined();
            expect(type).toBe(Payload.Type.Value);
            expect(path).toEqual([]);
            expect(value).toBe('anotherValue');
            expect(data?.truthy).toEqual({});
            expect(data?.falsy).toEqual({ 'test:partition': 'value' });
          });
        });
      });

      describe(Method.Push, () => {
        test('GIVEN provider w/o data THEN returns payload w/ missing data error', async () => {
          const payload = await josh[Method.Push]({ method: Method.Push, key: 'test:push', path: [], value: 'value' });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path, value } = payload;

          expect(method).toBe(Method.Push);
          expect(trigger).toBeUndefined();
          expect(error).toBeInstanceOf(Error);
          expect(error?.identifier).toBe(CommonIdentifiers.MissingData);
          expect(key).toBe('test:push');
          expect(path).toEqual([]);
          expect(value).toBe('value');
        });

        test('GIVEN provider w/o data at path THEN returns payload w/ missing data error', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:push', path: [], value: {} });

          const payload = await josh[Method.Push]({ method: Method.Push, key: 'test:push', path: 'path', value: 'value' });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path, value } = payload;

          expect(method).toBe(Method.Push);
          expect(trigger).toBeUndefined();
          expect(error).toBeInstanceOf(Error);
          expect(error?.identifier).toBe(CommonIdentifiers.MissingData);
          expect(key).toBe('test:push');
          expect(path).toEqual(['path']);
          expect(value).toBe('value');
        });

        test('GIVEN provider w/ invalid type at key THEN returns payload w/ invalid type error', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:push', path: [], value: 'value' });

          const payload = await josh[Method.Push]({ method: Method.Push, key: 'test:push', path: [], value: 'value' });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path, value } = payload;

          expect(method).toBe(Method.Push);
          expect(trigger).toBeUndefined();
          expect(error).toBeInstanceOf(Error);
          expect(error?.identifier).toBe(CommonIdentifiers.InvalidDataType);
          expect(key).toBe('test:push');
          expect(path).toEqual([]);
          expect(value).toBe('value');
        });

        test('GIVEN provider w/ invalid type at path THEN returns payload w/ invalid type error', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:push', path: 'path', value: 'value' });

          const payload = await josh[Method.Push]({ method: Method.Push, key: 'test:push', path: 'path', value: 'value' });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path, value } = payload;

          expect(method).toBe(Method.Push);
          expect(trigger).toBeUndefined();
          expect(error).toBeInstanceOf(Error);
          expect(error?.identifier).toBe(CommonIdentifiers.InvalidDataType);
          expect(key).toBe('test:push');
          expect(path).toEqual(['path']);
          expect(value).toBe('value');
        });

        test('GIVEN provider w/ array at key THEN returns payload AND pushes value to array at key', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:push', path: [], value: [] });

          const payload = await josh[Method.Push]({ method: Method.Push, key: 'test:push', path: [], value: 'value' });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path, value } = payload;

          expect(method).toBe(Method.Push);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(key).toBe('test:push');
          expect(path).toEqual([]);
          expect(value).toBe('value');
        });

        test('GIVEN provider w/ array at path THEN returns payload AND pushes value to array at path', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:push', path: 'path', value: [] });

          const payload = await josh[Method.Push]({ method: Method.Push, key: 'test:push', path: 'path', value: 'value' });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path, value } = payload;

          expect(method).toBe(Method.Push);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(key).toBe('test:push');
          expect(path).toEqual(['path']);
          expect(value).toBe('value');
        });
      });

      describe(Method.Random, () => {
        test('GIVEN provider w/o data THEN returns payload w/o data from random', async () => {
          const payload = await josh[Method.Random]({ method: Method.Random, count: 1, duplicates: false });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, data } = payload;

          expect(method).toBe(Method.Random);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(data).toBeUndefined();
        });

        test('GIVEN provider w/ data THEN returns payload w/ data from random', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:random', path: [], value: 'value' });

          const payload = await josh[Method.Random]({ method: Method.Random, count: 1, duplicates: false });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, data } = payload;

          expect(method).toBe(Method.Random);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(data).toEqual(['value']);
        });
      });

      describe(Method.RandomKey, () => {
        test('GIVEN provider w/o data THEN returns payload w/o data from randomKey', async () => {
          const payload = await josh[Method.RandomKey]({ method: Method.RandomKey, count: 1, duplicates: false });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, data } = payload;

          expect(method).toBe(Method.RandomKey);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(data).toBeUndefined();
        });

        test('GIVEN provider w/ data THEN returns payload w/ data from randomKey', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:randomKey', path: [], value: 'value' });

          const payload = await josh[Method.RandomKey]({ method: Method.RandomKey, count: 1, duplicates: false });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, data } = payload;

          expect(method).toBe(Method.RandomKey);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(data).toEqual(['test:randomKey']);
        });
      });

      describe(Method.Remove, () => {
        describe(Payload.Type.Hook, () => {
          test('GIVEN provider w/o data at key THEN returns payload w/ missing data error', async () => {
            const payload = await josh[Method.Remove]({
              method: Method.Remove,
              type: Payload.Type.Hook,
              key: 'test:remove',
              path: [],
              hook: (value: string) => value === 'value'
            });

            expect(typeof payload).toBe('object');

            const { method, trigger, error, type, key, path, hook } = payload;

            expect(method).toBe(Method.Remove);
            expect(trigger).toBeUndefined();
            expect(error).toBeInstanceOf(Error);
            expect(error?.identifier).toBe(CommonIdentifiers.MissingData);
            expect(type).toBe(Payload.Type.Hook);
            expect(key).toBe('test:remove');
            expect(path).toEqual([]);
            expect(typeof hook).toBe('function');
          });

          test('GIVEN provider w/ invalid type at key THEN returns payload w/ invalid type error', async () => {
            await josh[Method.Set]({ method: Method.Set, key: 'test:remove', path: [], value: 'value' });

            const payload = await josh[Method.Remove]({
              method: Method.Remove,
              type: Payload.Type.Hook,
              key: 'test:remove',
              path: [],
              hook: (value: string) => value === 'value'
            });

            expect(typeof payload).toBe('object');

            const { method, trigger, error, type, key, path, hook } = payload;

            expect(method).toBe(Method.Remove);
            expect(trigger).toBeUndefined();
            expect(error).toBeInstanceOf(Error);
            expect(error?.identifier).toBe(CommonIdentifiers.InvalidDataType);
            expect(type).toBe(Payload.Type.Hook);
            expect(key).toBe('test:remove');
            expect(path).toEqual([]);
            expect(typeof hook).toBe('function');
          });

          test('GIVEN provider w/ array at key THEN returns payload AND removes value from array at key', async () => {
            await josh[Method.Set]({ method: Method.Set, key: 'test:remove', path: [], value: ['value'] });

            const getBefore = await josh[Method.Get]({ method: Method.Get, key: 'test:remove', path: [] });

            expect(getBefore.data).toEqual(['value']);

            const payload = await josh[Method.Remove]({
              method: Method.Remove,
              type: Payload.Type.Hook,
              key: 'test:remove',
              path: [],
              hook: (value: string) => value === 'value'
            });

            expect(typeof payload).toBe('object');

            const { method, trigger, error, type, key, path, hook } = payload;

            expect(method).toBe(Method.Remove);
            expect(trigger).toBeUndefined();
            expect(error).toBeUndefined();
            expect(type).toBe(Payload.Type.Hook);
            expect(key).toBe('test:remove');
            expect(path).toEqual([]);
            expect(typeof hook).toBe('function');

            const getAfter = await josh[Method.Get]({ method: Method.Get, key: 'test:remove', path: [] });

            expect(getAfter.data).toEqual([]);
          });
        });

        describe(Payload.Type.Value, () => {
          test('GIVEN provider w/o data at key THEN returns payload w/ missing data error', async () => {
            const payload = await josh[Method.Remove]({
              method: Method.Remove,
              type: Payload.Type.Value,
              key: 'test:remove',
              path: [],
              value: 'value'
            });

            expect(typeof payload).toBe('object');

            const { method, trigger, error, type, key, path, value } = payload;

            expect(method).toBe(Method.Remove);
            expect(trigger).toBeUndefined();
            expect(error).toBeInstanceOf(Error);
            expect(error?.identifier).toBe(CommonIdentifiers.MissingData);
            expect(type).toBe(Payload.Type.Value);
            expect(key).toBe('test:remove');
            expect(path).toEqual([]);
            expect(value).toBe('value');
          });

          test('GIVEN provider w/ invalid type at key THEN returns payload w/ invalid type error', async () => {
            await josh[Method.Set]({ method: Method.Set, key: 'test:remove', path: [], value: 'value' });

            const payload = await josh[Method.Remove]({
              method: Method.Remove,
              type: Payload.Type.Value,
              key: 'test:remove',
              path: [],
              value: 'value'
            });

            expect(typeof payload).toBe('object');

            const { method, trigger, error, type, key, path, value } = payload;

            expect(method).toBe(Method.Remove);
            expect(trigger).toBeUndefined();
            expect(error).toBeInstanceOf(Error);
            expect(error?.identifier).toBe(CommonIdentifiers.InvalidDataType);
            expect(type).toBe(Payload.Type.Value);
            expect(key).toBe('test:remove');
            expect(path).toEqual([]);
            expect(value).toBe('value');
          });

          test('GIVEN provider w/ array at key THEN returns payload AND removes value from array at key', async () => {
            await josh[Method.Set]({ method: Method.Set, key: 'test:remove', path: [], value: ['value'] });

            const getBefore = await josh[Method.Get]({ method: Method.Get, key: 'test:remove', path: [] });

            expect(getBefore.data).toEqual(['value']);

            const payload = await josh[Method.Remove]({
              method: Method.Remove,
              type: Payload.Type.Value,
              key: 'test:remove',
              path: [],
              value: 'value'
            });

            expect(typeof payload).toBe('object');

            const { method, trigger, error, type, key, path, value } = payload;

            expect(method).toBe(Method.Remove);
            expect(trigger).toBeUndefined();
            expect(error).toBeUndefined();
            expect(type).toBe(Payload.Type.Value);
            expect(key).toBe('test:remove');
            expect(path).toEqual([]);
            expect(value).toBe('value');

            const getAfter = await josh[Method.Get]({ method: Method.Get, key: 'test:remove', path: [] });

            expect(getAfter.data).toEqual([]);
          });
        });
      });

      describe(Method.Set, () => {
        test('GIVEN provider w/o data THEN returns payload AND sets value at key', async () => {
          const hasBefore = await josh[Method.Has]({ method: Method.Has, key: 'test:set', path: [] });

          expect(hasBefore.data).toBe(false);

          const payload = await josh[Method.Set]({ method: Method.Set, key: 'test:set', path: [], value: 'value' });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path, value } = payload;

          expect(method).toBe(Method.Set);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(key).toBe('test:set');
          expect(path).toEqual([]);
          expect(value).toBe('value');

          const hasAfter = await josh[Method.Has]({ method: Method.Has, key: 'test:set', path: [] });

          expect(hasAfter.data).toBe(true);
        });

        test('GIVEN provider w/o data THEN returns payload AND sets value at key and path', async () => {
          const hasBefore = await josh[Method.Has]({ method: Method.Has, key: 'test:set', path: ['path'] });

          expect(hasBefore.data).toBe(false);

          const payload = await josh[Method.Set]({ method: Method.Set, key: 'test:set', path: 'path', value: 'value' });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, path, value } = payload;

          expect(method).toBe(Method.Set);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(key).toBe('test:set');
          expect(path).toEqual(['path']);
          expect(value).toBe('value');

          const hasAfter = await josh[Method.Has]({ method: Method.Has, key: 'test:set', path: ['path'] });

          expect(hasAfter.data).toBe(true);
        });
      });

      describe(Method.SetMany, () => {
        test('GIVEN provider w/o data THEN returns payload AND sets value at key', async () => {
          const hasBefore = await josh[Method.Has]({ method: Method.Has, key: 'test:setMany', path: [] });

          expect(hasBefore.data).toBe(false);

          const payload = await josh[Method.SetMany]({
            method: Method.SetMany,
            entries: [[{ key: 'test:setMany', path: [] }, 'value']],
            overwrite: true
          });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, entries } = payload;

          expect(method).toBe(Method.SetMany);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(entries).toEqual([[{ key: 'test:setMany', path: [] }, 'value']]);
        });

        test('GIVEN provider w/ data THEN returns payload AND does not set value at key', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:setMany', path: [], value: 'value' });

          const hasBefore = await josh[Method.Has]({ method: Method.Has, key: 'test:setMany', path: [] });

          expect(hasBefore.data).toBe(true);

          const payload = await josh[Method.SetMany]({
            method: Method.SetMany,
            entries: [[{ key: 'test:setMany', path: [] }, 'value-overwritten']],
            overwrite: false
          });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, entries } = payload;

          expect(method).toBe(Method.SetMany);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(entries).toEqual([[{ key: 'test:setMany', path: [] }, 'value-overwritten']]);

          const getAfter = await josh[Method.Get]({ method: Method.Get, key: 'test:setMany', path: [] });

          expect(getAfter.data).toBe('value');
        });
      });

      describe(Method.Size, () => {
        test('GIVEN provider w/o data THEN returns 0)', async () => {
          const payload = await josh[Method.Size]({ method: Method.Size });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, data } = payload;

          expect(method).toBe(Method.Size);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(data).toBe(0);
        });

        test('GIVEN provider w/ data THEN returns 1)', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:size', path: [], value: 'value' });

          const payload = await josh[Method.Size]({ method: Method.Size });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, data } = payload;

          expect(method).toBe(Method.Size);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(data).toBe(1);
        });
      });

      describe(Method.Some, () => {
        describe(Payload.Type.Hook, () => {
          test('GIVEN provider w/o data THEN returns false', async () => {
            const payload = await josh[Method.Some]({
              method: Method.Some,
              type: Payload.Type.Hook,
              hook: (value) => value === 'value'
            });

            expect(typeof payload).toBe('object');

            const { method, trigger, error, hook, data } = payload;

            expect(method).toBe(Method.Some);
            expect(trigger).toBeUndefined();
            expect(error).toBeUndefined();
            expect(typeof hook).toBe('function');
            expect(data).toBe(false);
          });

          test('GIVEN provider w/ data THEN returns true', async () => {
            await josh[Method.Set]({ method: Method.Set, key: 'test:some', path: [], value: 'value' });

            const payload = await josh[Method.Some]({
              method: Method.Some,
              type: Payload.Type.Hook,
              hook: (value) => value === 'value'
            });

            expect(typeof payload).toBe('object');

            const { method, trigger, error, hook, data } = payload;

            expect(method).toBe(Method.Some);
            expect(trigger).toBeUndefined();
            expect(error).toBeUndefined();
            expect(typeof hook).toBe('function');
            expect(data).toBe(true);
          });
        });

        describe(Payload.Type.Value, () => {
          test('GIVEN provider w/o data THEN returns false', async () => {
            const payload = await josh[Method.Some]({ method: Method.Some, type: Payload.Type.Value, path: 'path', value: 'value' });

            expect(typeof payload).toBe('object');

            const { method, trigger, error, path, value, data } = payload;

            expect(method).toBe(Method.Some);
            expect(trigger).toBeUndefined();
            expect(error).toBeUndefined();
            expect(path).toEqual(['path']);
            expect(value).toBe('value');
            expect(data).toBe(false);
          });

          test('GIVEN provider w/ data THEN returns true', async () => {
            await josh[Method.Set]({ method: Method.Set, key: 'test:some', path: 'path', value: 'value' });

            const payload = await josh[Method.Some]({ method: Method.Some, type: Payload.Type.Value, path: 'path', value: 'value' });

            expect(typeof payload).toBe('object');

            const { method, trigger, error, path, value, data } = payload;

            expect(method).toBe(Method.Some);
            expect(trigger).toBeUndefined();
            expect(error).toBeUndefined();
            expect(path).toEqual(['path']);
            expect(value).toBe('value');
            expect(data).toBe(true);
          });
        });
      });

      describe(Method.Update, () => {
        test('GIVEN provider w/o data THEN returns payload w/ missing data error', async () => {
          const payload = await josh[Method.Update]({ method: Method.Update, key: 'test:update', hook: (value) => value });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, hook } = payload;

          expect(method).toBe(Method.Update);
          expect(trigger).toBeUndefined();
          expect(error).toBeInstanceOf(Error);
          expect(error?.identifier).toBe(CommonIdentifiers.MissingData);
          expect(key).toBe('test:update');
          expect(typeof hook).toBe('function');
        });

        test('GIVEN provider w/ data at key THEN returns payload w/ data AND updates value at key', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:update', path: [], value: 'value' });

          const payload = await josh[Method.Update]({ method: Method.Update, key: 'test:update', hook: (value) => value });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, hook } = payload;

          expect(method).toBe(Method.Update);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(key).toBe('test:update');
          expect(typeof hook).toBe('function');
        });

        test('GIVEN provider w/ data at path THEN returns payload w/ data AND updates value at path', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:update', path: 'path', value: 'value' });

          const payload = await josh[Method.Update]({ method: Method.Update, key: 'test:update', hook: (value) => value });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, key, hook } = payload;

          expect(method).toBe(Method.Update);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(key).toBe('test:update');
          expect(typeof hook).toBe('function');
        });
      });

      describe(Method.Values, () => {
        test('GIVEN provider w/o data THEN returns payload w/o data', async () => {
          const payload = await josh[Method.Values]({ method: Method.Values });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, data } = payload;

          expect(method).toBe(Method.Values);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(data).toEqual([]);
        });

        test('GIVEN provider w/ data THEN returns payload w/ data', async () => {
          await josh[Method.Set]({ method: Method.Set, key: 'test:values', path: [], value: 'value' });

          const payload = await josh[Method.Values]({ method: Method.Values });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, data } = payload;

          expect(method).toBe(Method.Values);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(data).toEqual(['value']);
        });
      });

      describe(Method.Each, () => {
        test('GIVEN provider w/o data THEN loops 0 times', () => {
          const mockCallback = jest.fn(() => true);
          const payload = josh[Method.Each]({ method: Method.Each, hook: () => mockCallback() });

          expect(typeof payload).toBe('object');
          expect(mockCallback.mock.calls.length).toBe(0);
        });

        test('GIVEN provider w/ data THEN loops x times THEN clears', async () => {
          const mockCallback = jest.fn((..._) => true);

          await josh[Method.Set]({ method: Method.Set, key: 'test:each1', path: [], value: 'value1' });
          await josh[Method.Set]({ method: Method.Set, key: 'test:each2', path: [], value: 'value2' });
          await josh[Method.Set]({ method: Method.Set, key: 'test:each3', path: [], value: 'value3' });

          const payload = await josh[Method.Each]({ method: Method.Each, hook: mockCallback });

          expect(typeof payload).toBe('object');
          expect(mockCallback.mock.calls.length).toBe(3);
          expect(mockCallback.mock.calls).toContainEqual(['value1', 'test:each1']);
          expect(mockCallback.mock.calls).toContainEqual(['value2', 'test:each2']);
          expect(mockCallback.mock.calls).toContainEqual(['value3', 'test:each3']);
        });
      });
      */
  });
});
