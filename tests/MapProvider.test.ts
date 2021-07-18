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
			const { method, startTimestamp, endTimestamp } = provider.set('test', '', 'test');

			expect(method).toBe(Method.Set);
			expect(typeof startTimestamp).toBe('number');
			expect(typeof endTimestamp).toBe('number');
		});

		test('GIVEN get() THEN returns payload for get', () => {
			const { method, startTimestamp, endTimestamp, data } = provider.get('test', '');

			expect(method).toBe(Method.Get);
			expect(typeof startTimestamp).toBe('number');
			expect(typeof endTimestamp).toBe('number');
			expect(data).toBe('test');
		});

		test('GIVEN getAll() THEN returns payload for getAll', () => {
			const { method, startTimestamp, endTimestamp, data } = provider.getAll();

			expect(method).toBe(Method.GetAll);
			expect(typeof startTimestamp).toBe('number');
			expect(typeof endTimestamp).toBe('number');
			expect(data).toEqual({ test: 'test' });
		});
	});
});
