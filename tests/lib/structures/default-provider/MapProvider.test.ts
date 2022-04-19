import { CommonIdentifiers, JoshProviderError, MapProvider, MathOperator, Method, Payload } from '../../../../src';

describe('MapProvider', () => {
  describe('is a class', () => {
    test('GIVEN typeof MapProvider THEN returns function', () => {
      expect(typeof MapProvider).toBe('function');
    });

    test('GIVEN typeof ...prototype THEN returns object', () => {
      expect(typeof MapProvider.prototype).toBe('object');
    });
  });

  describe('can manipulate provider data', () => {
    const provider = new MapProvider({});

    beforeEach(() => {
      provider.clear({ method: Method.Clear });
    });

    describe(Method.AutoKey, () => {
      test('GIVEN ... THEN returns payload w/ generated key as data AND increments autoKeyCount', async () => {
        const payload = await provider.autoKey({ method: Method.AutoKey, data: '0' });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, data } = payload;

        expect(method).toBe(Method.AutoKey);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(typeof data).toBe('string');
      });

      test('each value of autoKey should be unique', async () => {
        const arr = await Promise.all([...Array(10)].map(async () => (await provider.autoKey({ method: Method.AutoKey, data: '0' })).data));
        const isUnique = new Set(arr).size === arr.length;

        expect(isUnique).toBe(true);
      });
    });

    describe(Method.Clear, () => {
      test('GIVEN provider w/o data THEN provider data cleared', async () => {
        const sizeBefore = await provider.size({ method: Method.Size, data: 0 });

        expect(sizeBefore.data).toBe(0);

        const payload = await provider.clear({ method: Method.Clear });

        expect(typeof payload).toBe('object');

        const { method, trigger, error } = payload;

        expect(method).toBe(Method.Clear);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();

        const sizeAfter = await provider.size({ method: Method.Size, data: 0 });

        expect(sizeAfter.data).toBe(0);
      });

      test('GIVEN provider w/ data THEN provider data cleared', async () => {
        await provider.set({ method: Method.Set, key: 'test:clear', path: [], value: 'value' });

        const sizeBefore = await provider.size({ method: Method.Size, data: 0 });

        expect(sizeBefore.data).toBe(1);

        const payload = await provider.clear({ method: Method.Clear });

        expect(typeof payload).toBe('object');

        const { method, trigger, error } = payload;

        expect(method).toBe(Method.Clear);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();

        const sizeAfter = await provider.size({ method: Method.Size, data: 0 });

        expect(sizeAfter.data).toBe(0);
      });
    });

    describe(Method.Dec, () => {
      test('GIVEN provider w/o data at key THEN returns payload w/ missing data error', async () => {
        const payload = await provider.dec({ method: Method.Dec, key: 'test:dec', path: [] });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path } = payload;

        expect(method).toBe(Method.Dec);
        expect(trigger).toBeUndefined();
        expect(error).toBeInstanceOf(JoshProviderError);
        expect(error?.identifier).toBe(CommonIdentifiers.MissingData);
        expect(key).toBe('test:dec');
        expect(path).toEqual([]);
      });

      test('GIVEN provider w/o data at path THEN returns payload w/ missing data error', async () => {
        const payload = await provider.dec({ method: Method.Dec, key: 'test:dec', path: ['path'] });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path } = payload;

        expect(method).toBe(Method.Dec);
        expect(trigger).toBeUndefined();
        expect(error).toBeInstanceOf(JoshProviderError);
        expect(error?.identifier).toBe(CommonIdentifiers.MissingData);
        expect(key).toBe('test:dec');
        expect(path).toEqual(['path']);
      });

      test('GIVEN provider w/ invalid type at key THEN returns payload w/ invalid type error', async () => {
        await provider.set({ method: Method.Set, key: 'test:dec', path: [], value: 'value' });

        const payload = await provider.dec({ method: Method.Dec, key: 'test:dec', path: [] });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path } = payload;

        expect(method).toBe(Method.Dec);
        expect(trigger).toBeUndefined();
        expect(error).toBeInstanceOf(JoshProviderError);
        expect(error?.identifier).toBe(CommonIdentifiers.InvalidDataType);
        expect(key).toBe('test:dec');
        expect(path).toEqual([]);
      });

      test('GIVEN provider w/ invalid type at path THEN returns payload w/ invalid type error', async () => {
        await provider.set({ method: Method.Set, key: 'test:dec', path: ['path'], value: 'value' });

        const payload = await provider.dec({ method: Method.Dec, key: 'test:dec', path: ['path'] });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path } = payload;

        expect(method).toBe(Method.Dec);
        expect(trigger).toBeUndefined();
        expect(error).toBeInstanceOf(JoshProviderError);
        expect(error?.identifier).toBe(CommonIdentifiers.InvalidDataType);
        expect(key).toBe('test:dec');
        expect(path).toEqual(['path']);
      });

      test('GIVEN provider w/ number at key THEN decremented number at key', async () => {
        await provider.set({ method: Method.Set, key: 'test:dec', path: [], value: 1 });

        const payload = await provider.dec({ method: Method.Dec, key: 'test:dec', path: [] });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path } = payload;

        expect(method).toBe(Method.Dec);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(key).toBe('test:dec');
        expect(path).toEqual([]);
      });

      test('GIVEN provider w/ number at path THEN decremented number at path', async () => {
        await provider.set({ method: Method.Set, key: 'test:dec', path: ['path'], value: 1 });

        const payload = await provider.dec({ method: Method.Dec, key: 'test:dec', path: ['path'] });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path } = payload;

        expect(method).toBe(Method.Dec);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(key).toBe('test:dec');
        expect(path).toEqual(['path']);
      });
    });

    describe(Method.Delete, () => {
      test('GIVEN provider w/ value at key THEN deletes value at key', async () => {
        await provider.set({ method: Method.Set, key: 'test:delete', path: [], value: 'value' });

        const hasBefore = await provider.has({ method: Method.Has, key: 'test:delete', path: [], data: false });

        expect(hasBefore.data).toBe(true);

        const payload = await provider.delete({ method: Method.Delete, key: 'test:delete', path: [] });

        expect(typeof payload).toBe('object');

        const { method, trigger, error } = payload;

        expect(method).toBe(Method.Delete);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();

        const hasAfter = await provider.has({ method: Method.Has, key: 'test:delete', path: [], data: false });

        expect(hasAfter.data).toBe(false);
      });

      test('GIVEN provider w/ value at path THEN deletes value at path', async () => {
        await provider.set({ method: Method.Set, key: 'test:delete', path: ['path'], value: 'value' });

        const hasBefore = await provider.has({ method: Method.Has, key: 'test:delete', path: ['path'], data: false });

        expect(hasBefore.data).toBe(true);

        const payload = await provider.delete({ method: Method.Delete, key: 'test:delete', path: ['path'] });

        expect(typeof payload).toBe('object');

        const { method, trigger, error } = payload;

        expect(method).toBe(Method.Delete);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();

        const hasAfter = await provider.has({ method: Method.Has, key: 'test:delete', path: ['path'], data: false });

        expect(hasAfter.data).toBe(false);
      });

      test('GIVEN provider w/ value at nested path THEN deletes value at nested path', async () => {
        await provider.set({ method: Method.Set, key: 'test:delete', path: ['path', 'nested'], value: 'value' });

        const hasBefore = await provider.has({ method: Method.Has, key: 'test:delete', path: ['path', 'nested'], data: false });

        expect(hasBefore.data).toBe(true);

        const payload = await provider.delete({ method: Method.Delete, key: 'test:delete', path: ['path', 'nested'] });

        expect(typeof payload).toBe('object');

        const { method, trigger, error } = payload;

        expect(method).toBe(Method.Delete);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();

        const hasAfter = await provider.has({ method: Method.Has, key: 'test:delete', path: ['path', 'nested'], data: false });

        expect(hasAfter.data).toBe(false);
      });
    });

    describe(Method.Ensure, () => {
      test('GIVEN provider w/o data at key THEN returns payload w/ data as defaultValue AND sets default value at key', async () => {
        const sizeBefore = await provider.size({ method: Method.Size, data: 0 });

        expect(sizeBefore.data).toBe(0);

        const payload = await provider.ensure({ method: Method.Ensure, key: 'test:ensure', defaultValue: 'defaultValue', data: 'defaultValue' });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, defaultValue, data } = payload;

        expect(method).toBe(Method.Ensure);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(key).toBe('test:ensure');
        expect(defaultValue).toBe('defaultValue');
        expect(data).toBe('defaultValue');

        const sizeAfter = await provider.size({ method: Method.Size, data: 0 });

        expect(sizeAfter.data).toBe(1);
      });

      test('GIVEN provider w/ value at key THEN returns payload w/ data as value at key', async () => {
        await provider.set({ method: Method.Set, key: 'test:ensure', path: [], value: 'value' });

        const payload = await provider.ensure({ method: Method.Ensure, key: 'test:ensure', defaultValue: 'defaultValue', data: 'defaultValue' });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, defaultValue, data } = payload;

        expect(method).toBe(Method.Ensure);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(key).toBe('test:ensure');
        expect(defaultValue).toBe('defaultValue');
        expect(data).toBe('value');
      });
    });

    describe(Method.Every, () => {
      describe('hook type', () => {
        test('GIVEN provider w/o data THEN returns payload(true)', async () => {
          const payload = await provider.every({
            method: Method.Every,
            type: Payload.Type.Hook,
            hook: (value) => value === 'value',
            data: true
          });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, hook, data } = payload;

          expect(method).toBe(Method.Every);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(typeof hook).toBe('function');
          expect(data).toBe(true);
        });

        test('GIVEN provider w/ data THEN returns payload(true)', async () => {
          await provider.setMany({
            method: Method.SetMany,
            entries: [
              [{ key: 'firstKey', path: [] }, 'value'],
              [{ key: 'secondKey', path: [] }, 'value']
            ],
            overwrite: true
          });

          const payload = await provider.every({
            method: Method.Every,
            type: Payload.Type.Hook,
            hook: (value) => value === 'value',
            data: true
          });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, hook, data } = payload;

          expect(method).toBe(Method.Every);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(typeof hook).toBe('function');
          expect(data).toBe(true);
        });
      });

      describe('value type', () => {
        test('GIVEN provider w/o data THEN returns payload(true)', async () => {
          const payload = await provider.every({ method: Method.Every, type: Payload.Type.Value, path: ['path'], value: 'value', data: true });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, path, value, data } = payload;

          expect(method).toBe(Method.Every);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(path).toEqual(['path']);
          expect(value).toBe('value');
          expect(data).toBe(true);
        });

        test('GIVEN provider w/ data THEN returns payload(true)', async () => {
          await provider.setMany({
            method: Method.SetMany,
            entries: [
              [{ key: 'firstKey', path: ['path'] }, 'value'],
              [{ key: 'secondKey', path: ['path'] }, 'value']
            ],
            overwrite: true
          });

          const payload = await provider.every({ method: Method.Every, type: Payload.Type.Value, path: ['path'], value: 'value', data: true });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, path, value, data } = payload;

          expect(method).toBe(Method.Every);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(path).toEqual(['path']);
          expect(value).toBe('value');
          expect(data).toBe(true);
        });
      });
    });

    describe(Method.Filter, () => {
      describe('hook type', () => {
        test('GIVEN provider w/o data THEN returns payload w/o data from filter', async () => {
          const payload = await provider.filter({
            method: Method.Filter,
            type: Payload.Type.Hook,
            hook: (value) => value === 'value',
            data: {}
          });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, hook, data } = payload;

          expect(method).toBe(Method.Filter);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(typeof hook).toBe('function');
          expect(data).toEqual({});
        });

        test('GIVEN provider w/ data THEN returns payload w/ data from filter', async () => {
          await provider.set({ method: Method.Set, key: 'test:filter', path: [], value: 'value' });

          const payload = await provider.filter({
            method: Method.Filter,
            type: Payload.Type.Hook,
            hook: (value) => value === 'value',
            data: {}
          });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, hook, data } = payload;

          expect(method).toBe(Method.Filter);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(typeof hook).toBe('function');
          expect(data).toEqual({ 'test:filter': 'value' });
        });
      });

      describe('value type', () => {
        test('GIVEN provider w/o data THEN returns payload w/o data from filter', async () => {
          const payload = await provider.filter({ method: Method.Filter, type: Payload.Type.Value, path: ['path'], value: 'value', data: {} });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, path, value, data } = payload;

          expect(method).toBe(Method.Filter);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(path).toEqual(['path']);
          expect(value).toBe('value');
          expect(data).toEqual({});
        });

        test('GIVEN provider w/ data THEN returns payload w/ data from filter', async () => {
          await provider.set({ method: Method.Set, key: 'test:filter', path: ['path'], value: 'value' });

          const payload = await provider.filter({ method: Method.Filter, type: Payload.Type.Value, path: ['path'], value: 'value', data: {} });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, path, value, data } = payload;

          expect(method).toBe(Method.Filter);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(path).toEqual(['path']);
          expect(value).toBe('value');
          expect(data).toEqual({ 'test:filter': { path: 'value' } });
        });
      });
    });

    describe(Method.Find, () => {
      describe('hook type', () => {
        test('GIVEN provider w/o data THEN returns payload w/o data from find', async () => {
          const payload = await provider.find({ method: Method.Find, type: Payload.Type.Hook, hook: (value) => value === 'value' });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, hook, data } = payload;

          await provider.set({ method: Method.Set, key: 'test:size', path: [], value: 'value' });
          expect(method).toBe(Method.Find);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(typeof hook).toBe('function');
          expect(data).toEqual([null, null]);
        });

        test('GIVEN provider w/ data THEN returns payload w/ data from find', async () => {
          await provider.set({ method: Method.Set, key: 'test:find', path: [], value: 'value' });

          const payload = await provider.find({ method: Method.Find, type: Payload.Type.Hook, hook: (value) => value === 'value' });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, hook, data } = payload;

          expect(method).toBe(Method.Find);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(typeof hook).toBe('function');
          expect(data).toEqual(['test:find', 'value']);
        });
      });

      describe('value type', () => {
        test('GIVEN provider w/o data THEN returns payload w/o data from find', async () => {
          const payload = await provider.find({ method: Method.Find, type: Payload.Type.Value, path: ['path'], value: 'value' });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, path, value, data } = payload;

          expect(method).toBe(Method.Find);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(path).toEqual(['path']);
          expect(value).toBe('value');
          expect(data).toEqual([null, null]);
        });

        test('GIVEN provider w/ data THEN returns payload w/o data from find', async () => {
          await provider.set({ method: Method.Set, key: 'test:find', path: ['path'], value: 'value' });

          const payload = await provider.find({ method: Method.Find, type: Payload.Type.Value, path: ['path'], value: 'value' });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, path, value, data } = payload;

          expect(method).toBe(Method.Find);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(path).toEqual(['path']);
          expect(value).toBe('value');
          expect(data).toEqual(['test:find', { path: 'value' }]);
        });
      });
    });

    describe(Method.Get, () => {
      test('GIVEN provider w/o data THEN returns payload w/o data from get', async () => {
        const payload = await provider.get({ method: Method.Get, key: 'test:get', path: [] });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path, data } = payload;

        expect(method).toBe(Method.Get);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(key).toBe('test:get');
        expect(path).toEqual([]);
        expect(data).toBeUndefined();
      });

      test('GIVEN provider w/ value at key THEN returns payload w/ data from get at key', async () => {
        await provider.set({ method: Method.Set, key: 'test:get', path: [], value: 'value' });

        const payload = await provider.get({ method: Method.Get, key: 'test:get', path: [] });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path, data } = payload;

        expect(method).toBe(Method.Get);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(key).toBe('test:get');
        expect(path).toEqual([]);
        expect(data).toBe('value');
      });

      test('GIVEN provider w/ value at path THEN returns payload w/ data from get at path', async () => {
        await provider.set({ method: Method.Set, key: 'test:get', path: ['path'], value: 'value' });

        const payload = await provider.get({ method: Method.Get, key: 'test:get', path: ['path'] });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path, data } = payload;

        expect(method).toBe(Method.Get);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(key).toBe('test:get');
        expect(path).toEqual(['path']);
        expect(data).toBe('value');
      });
    });

    describe(Method.GetAll, () => {
      test('GIVEN provider w/o data THEN returns payload w/o data from getAll', async () => {
        const payload = await provider.getAll({ method: Method.GetAll, data: {} });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, data } = payload;

        expect(method).toBe(Method.GetAll);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(data).toEqual({});
      });

      test('GIVEN provider w/ data THEN returns payload w/ data from getAll', async () => {
        await provider.set({ method: Method.Set, key: 'test:getAll', path: [], value: 'value' });

        const payload = await provider.getAll({ method: Method.GetAll, data: {} });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, data } = payload;

        expect(method).toBe(Method.GetAll);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(data).toEqual({ 'test:getAll': 'value' });
      });
    });

    describe(Method.GetMany, () => {
      test('GIVEN provider w/o data THEN returns payload w/o data from getMany', async () => {
        await provider.set({ method: Method.Set, key: 'test:getMany', path: [], value: null });

        const payload = await provider.getMany({ method: Method.GetMany, keys: ['test:getMany'], data: {} });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, keys, data } = payload;

        expect(method).toBe(Method.GetMany);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(keys).toEqual(['test:getMany']);
        expect(data).toEqual({ 'test:getMany': null });
      });

      test('GIVEN provider w/ data THEN returns payload w/ data from getMany', async () => {
        await provider.set({ method: Method.Set, key: 'test:getMany', path: [], value: 'value' });

        const payload = await provider.getMany({ method: Method.GetMany, keys: ['test:getMany'], data: {} });

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
      test('GIVEN provider w/o data at key THEN returns payload(false)', async () => {
        const payload = await provider.has({ method: Method.Has, key: 'test:has', path: [], data: false });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path, data } = payload;

        expect(method).toBe(Method.Has);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(key).toBe('test:has');
        expect(path).toEqual([]);
        expect(data).toBe(false);
      });

      test('GIVEN provider w/o data at path THEN returns payload(false)', async () => {
        await provider.set({ method: Method.Set, key: 'test:has', path: [], value: 'value' });

        const payload = await provider.has({ method: Method.Has, key: 'test:has', path: ['path'], data: false });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path, data } = payload;

        expect(method).toBe(Method.Has);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(key).toBe('test:has');
        expect(path).toEqual(['path']);
        expect(data).toBe(false);
      });

      test('GIVEN provider w/ data at key THEN returns payload(true)', async () => {
        await provider.set({ method: Method.Set, key: 'test:has', path: [], value: 'value' });

        const payload = await provider.has({ method: Method.Has, key: 'test:has', path: [], data: false });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path, data } = payload;

        expect(method).toBe(Method.Has);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(key).toBe('test:has');
        expect(path).toEqual([]);
        expect(data).toBe(true);
      });

      test('GIVEN provider w/ data at path THEN returns payload(true)', async () => {
        await provider.set({ method: Method.Set, key: 'test:has', path: ['path'], value: 'value' });

        const payload = await provider.has({ method: Method.Has, key: 'test:has', path: ['path'], data: false });

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
        const payload = await provider.inc({ method: Method.Inc, key: 'test:inc', path: [] });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path } = payload;

        expect(method).toBe(Method.Inc);
        expect(trigger).toBeUndefined();
        expect(error).toBeInstanceOf(JoshProviderError);
        expect(error?.identifier).toBe(CommonIdentifiers.MissingData);
        expect(key).toBe('test:inc');
        expect(path).toEqual([]);
      });

      test('GIVEN provider w/o data at path THEN returns payload w/ missing data error', async () => {
        const payload = await provider.inc({ method: Method.Inc, key: 'test:inc', path: ['path'] });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path } = payload;

        expect(method).toBe(Method.Inc);
        expect(trigger).toBeUndefined();
        expect(error).toBeInstanceOf(JoshProviderError);
        expect(error?.identifier).toBe(CommonIdentifiers.MissingData);
        expect(key).toBe('test:inc');
        expect(path).toEqual(['path']);
      });

      test('GIVEN provider w/ invalid type at key THEN returns payload w/ invalid type error', async () => {
        await provider.set({ method: Method.Set, key: 'test:inc', path: [], value: 'value' });

        const payload = await provider.inc({ method: Method.Inc, key: 'test:inc', path: [] });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path } = payload;

        expect(method).toBe(Method.Inc);
        expect(trigger).toBeUndefined();
        expect(error).toBeInstanceOf(JoshProviderError);
        expect(error?.identifier).toBe(CommonIdentifiers.InvalidDataType);
        expect(key).toBe('test:inc');
        expect(path).toEqual([]);
      });

      test('GIVEN provider w/ invalid type at path THEN returns payload w/ invalid type error', async () => {
        await provider.set({ method: Method.Set, key: 'test:inc', path: ['path'], value: 'value' });

        const payload = await provider.inc({ method: Method.Inc, key: 'test:inc', path: ['path'] });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path } = payload;

        expect(method).toBe(Method.Inc);
        expect(trigger).toBeUndefined();
        expect(error).toBeInstanceOf(JoshProviderError);
        expect(error?.identifier).toBe(CommonIdentifiers.InvalidDataType);
        expect(key).toBe('test:inc');
        expect(path).toEqual(['path']);
      });

      test('GIVEN provider w/ number at key THEN incremented number at key', async () => {
        await provider.set({ method: Method.Set, key: 'test:inc', path: [], value: 0 });

        const payload = await provider.inc({ method: Method.Inc, key: 'test:inc', path: [] });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path } = payload;

        expect(method).toBe(Method.Inc);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(key).toBe('test:inc');
        expect(path).toEqual([]);
      });

      test('GIVEN provider w/ number at path THEN incremented number at key and path', async () => {
        await provider.set({ method: Method.Set, key: 'test:inc', path: ['path'], value: 0 });

        const payload = await provider.inc({ method: Method.Inc, key: 'test:inc', path: ['path'] });

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
        const payload = await provider.keys({ method: Method.Keys, data: [] });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, data } = payload;

        expect(method).toBe(Method.Keys);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(data).toEqual([]);
      });

      test('GIVEN provider w/ data THEN returns payload w/ data from keys', async () => {
        await provider.set({ method: Method.Set, key: 'test:keys', path: [], value: 'value' });

        const payload = await provider.keys({ method: Method.Keys, data: [] });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, data } = payload;

        expect(method).toBe(Method.Keys);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(data).toEqual(['test:keys']);
      });
    });

    describe(Method.Map, () => {
      describe('hook type', () => {
        test('GIVEN provider w/o data THEN returns payload w/o data from map', async () => {
          const payload = await provider.map({ method: Method.Map, type: Payload.Type.Hook, hook: (value) => value, data: [] });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, hook, data } = payload;

          expect(method).toBe(Method.Map);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(typeof hook).toBe('function');
          expect(data).toEqual([]);
        });

        test('GIVEN provider w/ data THEN returns payload w/ data from map', async () => {
          await provider.set({ method: Method.Set, key: 'test:map', path: [], value: 'value' });

          const payload = await provider.map({ method: Method.Map, type: Payload.Type.Hook, hook: (value) => value, data: [] });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, hook, data } = payload;

          expect(method).toBe(Method.Map);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(typeof hook).toBe('function');
          expect(data).toEqual(['value']);
        });
      });

      describe('path type', () => {
        test('GIVEN provider w/o data THEN returns payload w/o data from map', async () => {
          const payload = await provider.map({ method: Method.Map, type: Payload.Type.Path, path: [], data: [] });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, path, data } = payload;

          expect(method).toBe(Method.Map);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(path).toEqual([]);
          expect(data).toEqual([]);
        });

        test('GIVEN provider w/ data THEN returns payload w/ data from map', async () => {
          await provider.set({ method: Method.Set, key: 'test:map', path: [], value: 'value' });

          const payload = await provider.map({ method: Method.Map, type: Payload.Type.Path, path: [], data: [] });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, path, data } = payload;

          expect(method).toBe(Method.Map);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(path).toEqual([]);
          expect(data).toEqual(['value']);
        });

        test('GIVEN provider w/ data at path THEN returns payload w/ data from map', async () => {
          await provider.set({ method: Method.Set, key: 'test:map', path: ['path'], value: 'value' });

          const payload = await provider.map({ method: Method.Map, type: Payload.Type.Path, path: ['path'], data: [] });

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
        const payload = await provider.math({ method: Method.Math, key: 'test:math', path: [], operator: MathOperator.Addition, operand: 1 });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path, operator, operand } = payload;

        expect(method).toBe(Method.Math);
        expect(trigger).toBeUndefined();
        expect(error).toBeInstanceOf(JoshProviderError);
        expect(error?.identifier).toBe(CommonIdentifiers.MissingData);
        expect(key).toBe('test:math');
        expect(path).toEqual([]);
        expect(operator).toBe(MathOperator.Addition);
        expect(operand).toBe(1);
      });

      test('GIVEN provider w/o data at path THEN returns payload w/ error', async () => {
        await provider.set({ method: Method.Set, key: 'test:math', path: [], value: 0 });

        const payload = await provider.math({ method: Method.Math, key: 'test:math', path: ['path'], operator: MathOperator.Addition, operand: 1 });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path, operator, operand } = payload;

        expect(method).toBe(Method.Math);
        expect(trigger).toBeUndefined();
        expect(error).toBeInstanceOf(JoshProviderError);
        expect(error?.identifier).toBe(CommonIdentifiers.MissingData);
        expect(key).toBe('test:math');
        expect(path).toEqual(['path']);
        expect(operator).toBe(MathOperator.Addition);
        expect(operand).toBe(1);
      });

      test('GIVEN provider w/ invalid type at key THEN returns payload w/ error', async () => {
        await provider.set({ method: Method.Set, key: 'test:math', path: [], value: 'value' });

        const payload = await provider.math({ method: Method.Math, key: 'test:math', path: [], operator: MathOperator.Addition, operand: 1 });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path, operator, operand } = payload;

        expect(method).toBe(Method.Math);
        expect(trigger).toBeUndefined();
        expect(error).toBeInstanceOf(JoshProviderError);
        expect(error?.identifier).toBe(CommonIdentifiers.InvalidDataType);
        expect(key).toBe('test:math');
        expect(path).toEqual([]);
        expect(operator).toBe(MathOperator.Addition);
        expect(operand).toBe(1);
      });

      test('GIVEN provider w/ invalid type at path THEN returns payload w/ error', async () => {
        await provider.set({ method: Method.Set, key: 'test:math', path: ['path'], value: 'value' });

        const payload = await provider.math({ method: Method.Math, key: 'test:math', path: ['path'], operator: MathOperator.Addition, operand: 1 });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path, operator, operand } = payload;

        expect(method).toBe(Method.Math);
        expect(trigger).toBeUndefined();
        expect(error).toBeInstanceOf(JoshProviderError);
        expect(error?.identifier).toBe(CommonIdentifiers.InvalidDataType);
        expect(key).toBe('test:math');
        expect(path).toEqual(['path']);
        expect(operator).toBe(MathOperator.Addition);
        expect(operand).toBe(1);
      });
    });

    describe(Method.Partition, () => {
      describe('hook type', () => {
        test('GIVEN provider w/o data THEN returns payload w/o data', async () => {
          const payload = await provider.partition({
            method: Method.Partition,
            type: Payload.Type.Hook,
            hook: (value) => value === 'value',
            data: { truthy: {}, falsy: {} }
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
          await provider.set({ method: Method.Set, key: 'test:partition', path: [], value: 'value' });

          const payload = await provider.partition({
            method: Method.Partition,
            type: Payload.Type.Hook,
            hook: (value) => value === 'value',
            data: { truthy: {}, falsy: {} }
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
          await provider.set({ method: Method.Set, key: 'test:partition', path: [], value: 'value' });

          const payload = await provider.partition({
            method: Method.Partition,
            type: Payload.Type.Hook,
            hook: (value) => value !== 'value',
            data: { truthy: {}, falsy: {} }
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

      describe('value type', () => {
        test('GIVEN provider w/o data THEN returns payload w/o data', async () => {
          const payload = await provider.partition({
            method: Method.Partition,
            type: Payload.Type.Value,
            path: [],
            value: 'value',
            data: { truthy: {}, falsy: {} }
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
          await provider.set({ method: Method.Set, key: 'test:partition', path: [], value: 'value' });

          const payload = await provider.partition({
            method: Method.Partition,
            type: Payload.Type.Value,
            path: [],
            value: 'value',
            data: { truthy: {}, falsy: {} }
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
          await provider.set({ method: Method.Set, key: 'test:partition', path: [], value: 'value' });

          const payload = await provider.partition({
            method: Method.Partition,
            type: Payload.Type.Value,
            path: [],
            value: 'anotherValue',
            data: { truthy: {}, falsy: {} }
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
        const payload = await provider.push({ method: Method.Push, key: 'test:push', path: [], value: 'value' });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path, value } = payload;

        expect(method).toBe(Method.Push);
        expect(trigger).toBeUndefined();
        expect(error).toBeInstanceOf(JoshProviderError);
        expect(error?.identifier).toBe(CommonIdentifiers.MissingData);
        expect(key).toBe('test:push');
        expect(path).toEqual([]);
        expect(value).toBe('value');
      });

      test('GIVEN provider w/o data at path THEN returns payload w/ missing data error', async () => {
        await provider.set({ method: Method.Set, key: 'test:push', path: [], value: {} });

        const payload = await provider.push({ method: Method.Push, key: 'test:push', path: ['path'], value: 'value' });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path, value } = payload;

        expect(method).toBe(Method.Push);
        expect(trigger).toBeUndefined();
        expect(error).toBeInstanceOf(JoshProviderError);
        expect(error?.identifier).toBe(CommonIdentifiers.MissingData);
        expect(key).toBe('test:push');
        expect(path).toEqual(['path']);
        expect(value).toBe('value');
      });

      test('GIVEN provider w/ invalid type at key THEN returns payload w/ invalid type error', async () => {
        await provider.set({ method: Method.Set, key: 'test:push', path: [], value: 'value' });

        const payload = await provider.push({ method: Method.Push, key: 'test:push', path: [], value: 'value' });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path, value } = payload;

        expect(method).toBe(Method.Push);
        expect(trigger).toBeUndefined();
        expect(error).toBeInstanceOf(JoshProviderError);
        expect(error?.identifier).toBe(CommonIdentifiers.InvalidDataType);
        expect(key).toBe('test:push');
        expect(path).toEqual([]);
        expect(value).toBe('value');
      });

      test('GIVEN provider w/ invalid type at path THEN returns payload w/ invalid type error', async () => {
        await provider.set({ method: Method.Set, key: 'test:push', path: ['path'], value: 'value' });

        const payload = await provider.push({ method: Method.Push, key: 'test:push', path: ['path'], value: 'value' });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path, value } = payload;

        expect(method).toBe(Method.Push);
        expect(trigger).toBeUndefined();
        expect(error).toBeInstanceOf(JoshProviderError);
        expect(error?.identifier).toBe(CommonIdentifiers.InvalidDataType);
        expect(key).toBe('test:push');
        expect(path).toEqual(['path']);
        expect(value).toBe('value');
      });

      test('GIVEN provider w/ array at key THEN returns payload AND pushes value to array at key', async () => {
        await provider.set({ method: Method.Set, key: 'test:push', path: [], value: [] });

        const payload = await provider.push({ method: Method.Push, key: 'test:push', path: [], value: 'value' });

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
        await provider.set({ method: Method.Set, key: 'test:push', path: ['path'], value: [] });

        const payload = await provider.push({ method: Method.Push, key: 'test:push', path: ['path'], value: 'value' });

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
        const payload = await provider.random({ method: Method.Random, count: 1, duplicates: false });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, data } = payload;

        expect(method).toBe(Method.Random);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(data).toBeUndefined();
      });

      test('GIVEN provider w/ data THEN returns payload w/ data from random', async () => {
        await provider.set({ method: Method.Set, key: 'test:random', path: [], value: 'value' });

        const payload = await provider.random({ method: Method.Random, count: 1, duplicates: false });

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
        const payload = await provider.randomKey({ method: Method.RandomKey, count: 1, duplicates: false });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, data } = payload;

        expect(method).toBe(Method.RandomKey);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(data).toBeUndefined();
      });

      test('GIVEN provider w/ data THEN returns payload w/ data from randomKey', async () => {
        await provider.set({ method: Method.Set, key: 'test:randomKey', path: [], value: 'value' });

        const payload = await provider.randomKey({ method: Method.RandomKey, count: 1, duplicates: false });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, data } = payload;

        expect(method).toBe(Method.RandomKey);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(data).toEqual(['test:randomKey']);
      });
    });

    describe(Method.Remove, () => {
      describe('hook type', () => {
        test('GIVEN provider w/o data at key THEN returns payload w/ missing data error', async () => {
          const payload = await provider.remove({
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
          expect(error).toBeInstanceOf(JoshProviderError);
          expect(error?.identifier).toBe(CommonIdentifiers.MissingData);
          expect(type).toBe(Payload.Type.Hook);
          expect(key).toBe('test:remove');
          expect(path).toEqual([]);
          expect(typeof hook).toBe('function');
        });

        test('GIVEN provider w/ invalid type at key THEN returns payload w/ invalid type error', async () => {
          await provider.set({ method: Method.Set, key: 'test:remove', path: [], value: 'value' });

          const payload = await provider.remove({
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
          expect(error).toBeInstanceOf(JoshProviderError);
          expect(error?.identifier).toBe(CommonIdentifiers.InvalidDataType);
          expect(type).toBe(Payload.Type.Hook);
          expect(key).toBe('test:remove');
          expect(path).toEqual([]);
          expect(typeof hook).toBe('function');
        });

        test('GIVEN provider w/ array at key THEN returns payload AND removes value from array at key', async () => {
          await provider.set({ method: Method.Set, key: 'test:remove', path: [], value: ['value'] });

          const getBefore = await provider.get({ method: Method.Get, key: 'test:remove', path: [] });

          expect(getBefore.data).toEqual(['value']);

          const payload = await provider.remove({
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

          const getAfter = await provider.get({ method: Method.Get, key: 'test:remove', path: [] });

          expect(getAfter.data).toEqual([]);
        });
      });

      describe('value type', () => {
        test('GIVEN provider w/o data at key THEN returns payload w/ missing data error', async () => {
          const payload = await provider.remove({
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
          expect(error).toBeInstanceOf(JoshProviderError);
          expect(error?.identifier).toBe(CommonIdentifiers.MissingData);
          expect(type).toBe(Payload.Type.Value);
          expect(key).toBe('test:remove');
          expect(path).toEqual([]);
          expect(value).toBe('value');
        });

        test('GIVEN provider w/ invalid type at key THEN returns payload w/ invalid type error', async () => {
          await provider.set({ method: Method.Set, key: 'test:remove', path: [], value: 'value' });

          const payload = await provider.remove({
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
          expect(error).toBeInstanceOf(JoshProviderError);
          expect(error?.identifier).toBe(CommonIdentifiers.InvalidDataType);
          expect(type).toBe(Payload.Type.Value);
          expect(key).toBe('test:remove');
          expect(path).toEqual([]);
          expect(value).toBe('value');
        });

        test('GIVEN provider w/ array at key THEN returns payload AND removes value from array at key', async () => {
          await provider.set({ method: Method.Set, key: 'test:remove', path: [], value: ['value'] });

          const getBefore = await provider.get({ method: Method.Get, key: 'test:remove', path: [] });

          expect(getBefore.data).toEqual(['value']);

          const payload = await provider.remove({
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

          const getAfter = await provider.get({ method: Method.Get, key: 'test:remove', path: [] });

          expect(getAfter.data).toEqual([]);
        });
      });
    });

    describe(Method.Set, () => {
      test('GIVEN provider w/o data THEN returns payload AND sets value at key', async () => {
        const hasBefore = await provider.has({ method: Method.Has, key: 'test:set', path: [], data: false });

        expect(hasBefore.data).toBe(false);

        const payload = await provider.set({ method: Method.Set, key: 'test:set', path: [], value: 'value' });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path, value } = payload;

        expect(method).toBe(Method.Set);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(key).toBe('test:set');
        expect(path).toEqual([]);
        expect(value).toBe('value');

        const hasAfter = await provider.has({ method: Method.Has, key: 'test:set', path: [], data: false });

        expect(hasAfter.data).toBe(true);
      });

      test('GIVEN provider w/o data THEN returns payload AND sets value at key and path', async () => {
        const hasBefore = await provider.has({ method: Method.Has, key: 'test:set', path: ['path'], data: false });

        expect(hasBefore.data).toBe(false);

        const payload = await provider.set({ method: Method.Set, key: 'test:set', path: ['path'], value: 'value' });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, path, value } = payload;

        expect(method).toBe(Method.Set);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(key).toBe('test:set');
        expect(path).toEqual(['path']);
        expect(value).toBe('value');

        const hasAfter = await provider.has({ method: Method.Has, key: 'test:set', path: ['path'], data: false });

        expect(hasAfter.data).toBe(true);
      });
    });

    describe(Method.SetMany, () => {
      test('GIVEN provider w/o data THEN returns payload AND sets value at key', async () => {
        const hasBefore = await provider.has({ method: Method.Has, key: 'test:setMany', path: [], data: false });

        expect(hasBefore.data).toBe(false);

        const payload = await provider.setMany({
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
        await provider.set({ method: Method.Set, key: 'test:setMany', path: [], value: 'value' });

        const hasBefore = await provider.has({ method: Method.Has, key: 'test:setMany', path: [], data: false });

        expect(hasBefore.data).toBe(true);

        const payload = await provider.setMany({
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

        const getAfter = await provider.get({ method: Method.Get, key: 'test:setMany', path: [] });

        expect(getAfter.data).toBe('value');
      });
    });

    describe(Method.Size, () => {
      test('GIVEN provider w/o data THEN returns payload(0)', async () => {
        const payload = await provider.size({ method: Method.Size, data: 0 });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, data } = payload;

        expect(method).toBe(Method.Size);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(data).toBe(0);
      });

      test('GIVEN provider w/ data THEN returns payload(1)', async () => {
        await provider.set({ method: Method.Set, key: 'test:size', path: [], value: 'value' });

        const payload = await provider.size({ method: Method.Size, data: 0 });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, data } = payload;

        expect(method).toBe(Method.Size);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(data).toBe(1);
      });
    });

    describe(Method.Some, () => {
      describe('hook type', () => {
        test('GIVEN provider w/o data THEN returns payload(false)', async () => {
          const payload = await provider.some({
            method: Method.Some,
            type: Payload.Type.Hook,
            hook: (value) => value === 'value',
            data: false
          });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, hook, data } = payload;

          expect(method).toBe(Method.Some);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(typeof hook).toBe('function');
          expect(data).toBe(false);
        });

        test('GIVEN provider w/ data THEN returns payload(true)', async () => {
          await provider.set({ method: Method.Set, key: 'test:some', path: [], value: 'value' });

          const payload = await provider.some({
            method: Method.Some,
            type: Payload.Type.Hook,
            hook: (value) => value === 'value',
            data: false
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

      describe('value type', () => {
        test('GIVEN provider w/o data THEN returns payload(false)', async () => {
          const payload = await provider.some({ method: Method.Some, type: Payload.Type.Value, path: ['path'], value: 'value', data: false });

          expect(typeof payload).toBe('object');

          const { method, trigger, error, path, value, data } = payload;

          expect(method).toBe(Method.Some);
          expect(trigger).toBeUndefined();
          expect(error).toBeUndefined();
          expect(path).toEqual(['path']);
          expect(value).toBe('value');
          expect(data).toBe(false);
        });

        test('GIVEN provider w/ data THEN returns payload(true)', async () => {
          await provider.set({ method: Method.Set, key: 'test:some', path: ['path'], value: 'value' });

          const payload = await provider.some({ method: Method.Some, type: Payload.Type.Value, path: ['path'], value: 'value', data: false });

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
        const payload = await provider.update({ method: Method.Update, key: 'test:update', hook: (value) => value });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, hook } = payload;

        expect(method).toBe(Method.Update);
        expect(trigger).toBeUndefined();
        expect(error).toBeInstanceOf(JoshProviderError);
        expect(error?.identifier).toBe(CommonIdentifiers.MissingData);
        expect(key).toBe('test:update');
        expect(typeof hook).toBe('function');
      });

      test('GIVEN provider w/ data at key THEN returns payload w/ data AND updates value at key', async () => {
        await provider.set({ method: Method.Set, key: 'test:update', path: [], value: 'value' });

        const payload = await provider.update({ method: Method.Update, key: 'test:update', hook: (value) => value });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, key, hook } = payload;

        expect(method).toBe(Method.Update);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(key).toBe('test:update');
        expect(typeof hook).toBe('function');
      });

      test('GIVEN provider w/ data at path THEN returns payload w/ data AND updates value at path', async () => {
        await provider.set({ method: Method.Set, key: 'test:update', path: ['path'], value: 'value' });

        const payload = await provider.update({ method: Method.Update, key: 'test:update', hook: (value) => value });

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
        const payload = await provider.values({ method: Method.Values, data: [] });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, data } = payload;

        expect(method).toBe(Method.Values);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(data).toEqual([]);
      });

      test('GIVEN provider w/ data THEN returns payload w/ data', async () => {
        await provider.set({ method: Method.Set, key: 'test:values', path: [], value: 'value' });

        const payload = await provider.values({ method: Method.Values, data: [] });

        expect(typeof payload).toBe('object');

        const { method, trigger, error, data } = payload;

        expect(method).toBe(Method.Values);
        expect(trigger).toBeUndefined();
        expect(error).toBeUndefined();
        expect(data).toEqual(['value']);
      });
    });
  });
});
