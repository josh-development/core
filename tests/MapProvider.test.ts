import { Stopwatch } from '@sapphire/stopwatch';
import { MapProvider, Method } from '../src';

const provider = new MapProvider({ name: 'tests' });

describe('MapProvider', () => {
	describe('Initialization', () => {
		test('GIVEN init() THEN returns true', () => {
			void expect(provider.init()).resolves.toBe(true);
		});

		test('GIVEN name THEN returns provider name', () => {
			expect(provider.name).toBe('tests');
		});
	});

	describe('Payloads', () => {
		test('GIVEN set() THEN returns payload for set', () => {
			const { method, trigger, stopwatch, key, path } = provider.set(
				{ method: Method.Set, stopwatch: new Stopwatch(), key: 'test', path: '' },
				'test'
			);

			expect(method).toBe(Method.Set);
			expect(trigger).toBeUndefined();
			expect(stopwatch).toBeInstanceOf(Stopwatch);
			expect(key).toBe('test');
			expect(path).toBe('');
		});

		test('GIVEN get() THEN returns payload for get', () => {
			const { method, trigger, stopwatch, key, path, data } = provider.get({
				method: Method.Get,
				stopwatch: new Stopwatch(),
				key: 'test',
				path: '',
				data: null
			});

			expect(method).toBe(Method.Get);
			expect(trigger).toBeUndefined();
			expect(stopwatch).toBeInstanceOf(Stopwatch);
			expect(key).toBe('test');
			expect(path).toBe('');
			expect(data).toBe('test');
		});

		test('GIVEN getAll() THEN returns payload for getAll', () => {
			const { method, trigger, stopwatch, data } = provider.getAll({ method: Method.GetAll, stopwatch: new Stopwatch(), data: {} });

			expect(method).toBe(Method.GetAll);
			expect(trigger).toBeUndefined();
			expect(stopwatch).toBeInstanceOf(Stopwatch);
			expect(data).toEqual({ test: 'test' });
		});
	});
});
