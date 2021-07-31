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
		test('GIVEN ensure() THEN returns payload for ensure', () => {
			const { method, trigger, stopwatch, key, data, defaultValue } = provider.ensure({
				method: Method.Ensure,
				key: 'test',
				data: 'test',
				defaultValue: 'test'
			});

			expect(method).toBe(Method.Ensure);
			expect(trigger).toBeUndefined();
			expect(stopwatch).toBeInstanceOf(Stopwatch);
			expect(key).toBe('test');
			expect(data).toBe('test');
			expect(defaultValue).toBe('test');
		});

		test('GIVEN get() THEN returns payload for get', () => {
			const { method, trigger, stopwatch, key, path, data } = provider.get({
				method: Method.Get,
				key: 'test',
				path: [],
				data: null
			});

			expect(method).toBe(Method.Get);
			expect(trigger).toBeUndefined();
			expect(stopwatch).toBeInstanceOf(Stopwatch);
			expect(key).toBe('test');
			expect(path).toEqual([]);
			expect(data).toBe('test');
		});

		test('GIVEN getAll() THEN returns payload for getAll', () => {
			const { method, trigger, stopwatch, data } = provider.getAll({ method: Method.GetAll, data: {} });

			expect(method).toBe(Method.GetAll);
			expect(trigger).toBeUndefined();
			expect(stopwatch).toBeInstanceOf(Stopwatch);
			expect(data).toEqual({ test: 'test' });
		});

		test('GIVEN has() THEN returns payload for has', () => {
			const { method, trigger, stopwatch, key, path, data } = provider.has({
				method: Method.Has,
				key: 'test',
				path: [],
				data: false
			});

			expect(method).toBe(Method.Has);
			expect(trigger).toBeUndefined();
			expect(stopwatch).toBeInstanceOf(Stopwatch);
			expect(key).toBe('test');
			expect(path).toEqual([]);
			expect(data).toBe(true);
		});

		test('GIVEN set() THEN returns payload for set', () => {
			const { method, trigger, stopwatch, key, path } = provider.set({ method: Method.Set, key: 'test', path: [] }, 'test');

			expect(method).toBe(Method.Set);
			expect(trigger).toBeUndefined();
			expect(stopwatch).toBeInstanceOf(Stopwatch);
			expect(key).toBe('test');
			expect(path).toEqual([]);
		});
	});
});
