import { MapProvider, Method, Payload } from '../../../../src';

const provider = new MapProvider();

provider.set({ method: Method.Set, key: 'number' }, 1);
provider.set({ method: Method.Set, key: 'string' }, 'test');
provider.set({ method: Method.Set, key: 'array' }, []);

describe('MapProvider class', () => {
	describe('Initialization', () => {
		test('GIVEN init() THEN returns true', () => {
			void expect(provider.init({ name: 'tests' })).resolves.toEqual({ name: 'tests' });
		});

		test('GIVEN name THEN returns provider name', () => {
			expect(provider.name).toBe('tests');
		});
	});

	describe('Payload validation', () => {
		test('GIVEN autoKey() THEN returns payload for autoKey', () => {
			const { method, trigger, data } = provider.autoKey({ method: Method.AutoKey, data: '' });

			expect(method).toBe(Method.AutoKey);
			expect(trigger).toBeUndefined();
			expect(data).toBe('1');
		});

		test('GIVEN dec() THEN returns payload for dec', () => {
			const { method, trigger, key, path, data } = provider.dec({ method: Method.Dec, key: 'number' });

			expect(method).toBe(Method.Dec);
			expect(trigger).toBeUndefined();
			expect(key).toBe('number');
			expect(path).toBeUndefined();
			expect(data).toBe(0);
		});

		test('GIVEN delete() THEN returns payload for delete', () => {
			const { method, trigger, key, path } = provider.delete({ method: Method.Delete, key: 'string' });

			expect(method).toBe(Method.Delete);
			expect(trigger).toBeUndefined();
			expect(key).toBe('string');
			expect(path).toBeUndefined();
		});

		test('GIVEN ensure() THEN returns payload for ensure', () => {
			const { method, trigger, key, data, defaultValue } = provider.ensure({
				method: Method.Ensure,
				key: 'string',
				data: 'test',
				defaultValue: 'test'
			});

			expect(method).toBe(Method.Ensure);
			expect(trigger).toBeUndefined();
			expect(key).toBe('string');
			expect(data).toBe('test');
			expect(defaultValue).toBe('test');
		});

		test('GIVEN filterByData() THEN returns payload for filterByData', () => {
			const { method, trigger, type, path, inputData, data } = provider.filterByData({
				method: Method.Filter,
				type: Payload.Type.Data,
				inputData: 'test',
				data: {}
			});

			expect(method).toBe(Method.Filter);
			expect(trigger).toBeUndefined();
			expect(type).toBe(Payload.Type.Data);
			expect(path).toBeUndefined();
			expect(inputData).toBe('test');
			expect(data).toEqual({ string: 'test' });
		});

		test('GIVEN filterByHook() THEN returns payload for filterByHook', async () => {
			const { method, trigger, type, path, inputHook, data } = await provider.filterByHook({
				method: Method.Filter,
				type: Payload.Type.Hook,
				inputHook: (data) => data === 'test',
				data: {}
			});

			expect(method).toBe(Method.Filter);
			expect(trigger).toBeUndefined();
			expect(type).toBe(Payload.Type.Hook);
			expect(path).toBeUndefined();
			expect(typeof inputHook).toBe('function');
			expect(data).toEqual({ string: 'test' });
		});

		test('GIVEN findByData() THEN returns payload for findByData', () => {
			const { method, trigger, type, path, inputData, data } = provider.findByData({
				method: Method.Find,
				type: Payload.Type.Data,
				inputData: 'test'
			});

			expect(method).toBe(Method.Find);
			expect(trigger).toBeUndefined();
			expect(type).toBe(Payload.Type.Data);
			expect(path).toBeUndefined();
			expect(inputData).toBe('test');
			expect(data).toBe('test');
		});

		test('GIVEN findByHook() THEN returns payload for findByHook', async () => {
			const { method, trigger, type, path, inputHook, data } = await provider.findByHook({
				method: Method.Find,
				type: Payload.Type.Hook,
				inputHook: (data) => data === 'test'
			});

			expect(method).toBe(Method.Find);
			expect(trigger).toBeUndefined();
			expect(type).toBe(Payload.Type.Hook);
			expect(path).toBeUndefined();
			expect(typeof inputHook).toBe('function');
			expect(data).toBe('test');
		});

		test('GIVEN get() THEN returns payload for get', () => {
			const { method, trigger, key, path, data } = provider.get({
				method: Method.Get,
				key: 'string'
			});

			expect(method).toBe(Method.Get);
			expect(trigger).toBeUndefined();
			expect(key).toBe('string');
			expect(path).toBeUndefined();
			expect(data).toBe('test');
		});

		test('GIVEN getAll() THEN returns payload for getAll', () => {
			const { method, trigger, data } = provider.getAll({ method: Method.GetAll, data: {} });

			expect(method).toBe(Method.GetAll);
			expect(trigger).toBeUndefined();
			expect(Object.keys(data)).toContain('number');
			expect(Object.keys(data)).toContain('string');
			expect(Object.keys(data)).toContain('array');
			expect(Object.values(data)).toContain('test');
			expect(Object.values(data)).toContain(0);
			expect(Object.values(data)).toContainEqual([]);
		});

		test('GIVEN getMany() THEN returns payload for getMany', () => {
			const { method, trigger, keyPaths, data } = provider.getMany({ method: Method.GetMany, keyPaths: [['string', []]], data: {} });

			expect(method).toBe(Method.GetMany);
			expect(trigger).toBeUndefined();
			expect(keyPaths).toEqual([['string', []]]);
			expect(data).toEqual({ string: 'test' });
		});

		test('GIVEN has() THEN returns payload for has', () => {
			const { method, trigger, key, path, data } = provider.has({
				method: Method.Has,
				key: 'string',
				data: false
			});

			expect(method).toBe(Method.Has);
			expect(trigger).toBeUndefined();
			expect(key).toBe('string');
			expect(path).toBeUndefined();
			expect(data).toBe(true);
		});

		test('GIVEN inc() THEN returns payload for inc', () => {
			const { method, trigger, key, path, data } = provider.inc({ method: Method.Inc, key: 'number' });

			expect(method).toBe(Method.Inc);
			expect(trigger).toBeUndefined();
			expect(key).toBe('number');
			expect(path).toBeUndefined();
			expect(data).toBe(1);
		});

		test('GIVEN keys() THEN returns payload for keys', () => {
			const { method, trigger, data } = provider.keys({ method: Method.Keys, data: [] });

			expect(method).toBe(Method.Keys);
			expect(trigger).toBeUndefined();
			expect(data).toContain('string');
			expect(data).toContain('number');
			expect(data).toContain('array');
		});

		test('GIVEN mapByPath() THEN returns payload for mapByPath', () => {
			const { method, trigger, type, path, data } = provider.mapByPath({
				method: Method.Map,
				type: Payload.Type.Path,
				path: [],
				data: []
			});

			expect(method).toBe(Method.Map);
			expect(trigger).toBeUndefined();
			expect(type).toBe(Payload.Type.Path);
			expect(path).toEqual([]);
			expect(data).toContain(1);
			expect(data).toContain('test');
			expect(data).toContainEqual([]);
		});

		test('GIVEN mapByHook() THEN returns payload for mapByHook', async () => {
			const { method, trigger, type, hook, data } = await provider.mapByHook({
				method: Method.Map,
				type: Payload.Type.Hook,
				hook: (data) => data,
				data: []
			});

			expect(method).toBe(Method.Map);
			expect(trigger).toBeUndefined();
			expect(type).toBe(Payload.Type.Hook);
			expect(typeof hook).toBe('function');
			expect(data).toContain(1);
			expect(data).toContain('test');
			expect(data).toContainEqual([]);
		});

		test('GIVEN push() THEN returns payload for push', () => {
			const { method, trigger, key, path } = provider.push({ method: Method.Push, key: 'array' }, 'test');

			expect(method).toBe(Method.Push);
			expect(trigger).toBeUndefined();
			expect(key).toBe('array');
			expect(path).toBeUndefined();
		});

		test('GIVEN random() THEN returns payload for random', () => {
			const { method, trigger, data } = provider.random({ method: Method.Random });

			expect(method).toBe(Method.Random);
			expect(trigger).toBeUndefined();
			expect(data).toBeDefined();
		});

		test('GIVEN randomKey() THEN returns payload for randomKey', () => {
			const { method, trigger, data } = provider.randomKey({ method: Method.RandomKey });

			expect(method).toBe(Method.RandomKey);
			expect(trigger).toBeUndefined();
			expect(typeof data).toBe('string');
		});

		test('GIVEN set() THEN returns payload for set', () => {
			const { method, trigger, key, path } = provider.set({ method: Method.Set, key: 'string' }, 'test');

			expect(method).toBe(Method.Set);
			expect(trigger).toBeUndefined();
			expect(key).toBe('string');
			expect(path).toBeUndefined();
		});

		test('GIVEN setMany() THEN returns payload for setMany', () => {
			const { method, trigger, keyPaths } = provider.setMany({ method: Method.SetMany, keyPaths: [['string', []]] }, 'test');

			expect(method).toBe(Method.SetMany);
			expect(trigger).toBeUndefined();
			expect(keyPaths).toEqual([['string', []]]);
		});

		test('GIVEN size() THEN returns payload for size', () => {
			const { method, trigger, data } = provider.size({ method: Method.Size, data: 0 });

			expect(method).toBe(Method.Size);
			expect(trigger).toBeUndefined();
			expect(data).toBe(3);
		});

		test('GIVEN someByData() THEN returns payload for someByData', () => {
			const { method, trigger, type, path, inputData, data } = provider.someByData({
				method: Method.Some,
				type: Payload.Type.Data,
				inputData: 'test',
				data: false
			});

			expect(method).toBe(Method.Some);
			expect(trigger).toBeUndefined();
			expect(type).toBe(Payload.Type.Data);
			expect(path).toBeUndefined();
			expect(inputData).toBe('test');
			expect(data).toBe(true);
		});

		test('GIVEN someByHook() THEN returns payload for someByHook', async () => {
			const { method, trigger, type, path, inputHook, data } = await provider.someByHook({
				method: Method.Some,
				type: Payload.Type.Hook,
				inputHook: (data) => data === 'test',
				data: false
			});

			expect(method).toBe(Method.Some);
			expect(trigger).toBeUndefined();
			expect(type).toBe(Payload.Type.Hook);
			expect(path).toBeUndefined();
			expect(typeof inputHook).toBe('function');
			expect(data).toBe(true);
		});

		test('GIVEN updateByData() THEN returns payload for updateByData', () => {
			const { method, trigger, key, path, inputData, data } = provider.updateByData({
				method: Method.Update,
				key: 'string',
				type: Payload.Type.Data,
				inputData: 'test'
			});

			expect(method).toBe(Method.Update);
			expect(trigger).toBeUndefined();
			expect(key).toBe('string');
			expect(path).toBeUndefined();
			expect(inputData).toBe('test');
			expect(data).toBe('test');
		});

		test('GIVEN updateByHook() THEN returns payload for updateByHook', async () => {
			const { method, trigger, type, key, path, inputHook, data } = await provider.updateByHook({
				method: Method.Update,
				key: 'string',
				type: Payload.Type.Hook,
				inputHook: () => 'test'
			});

			expect(method).toBe(Method.Update);
			expect(trigger).toBeUndefined();
			expect(type).toBe(Payload.Type.Hook);
			expect(key).toBe('string');
			expect(path).toBeUndefined();
			expect(typeof inputHook).toBe('function');
			expect(data).toBe('test');
		});

		test('GIVEN values() THEN returns payload for values', () => {
			const { method, trigger, data } = provider.values({ method: Method.Values, data: [] });

			expect(method).toBe(Method.Values);
			expect(trigger).toBeUndefined();
			expect(data).toContain(1);
			expect(data).toContain('test');
			expect(data).toContainEqual(['test']);
		});
	});
});
