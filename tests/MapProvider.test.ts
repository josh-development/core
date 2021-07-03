import { MapProvider, Methods } from '../src';

const provider = new MapProvider({ name: 'tests' });

describe('MapProvider', () => {
	describe('Initialization', () => {
		test('GIVEN provider.init() THEN returns true', () => {
			void expect(provider.init()).resolves.toBe(true);
		});

		test('GIVEN provider.name THEN returns provider name', () => {
			expect(provider.name).toBe('tests');
		});
	});

	describe('Payloads', () => {
		test('GIVEN key, path and value THEN returns payload for set', () => {
			const { method, startTimestamp, endTimestamp } = provider.set('test', '', 'test');

			expect(method).toBe(Methods.Set);
			expect(typeof startTimestamp).toBe('number');
			expect(typeof endTimestamp).toBe('number');
		});

		test('GIVEN key and path THEN returns payload for get', () => {
			const { method, startTimestamp, endTimestamp, data } = provider.get('test', '');

			expect(method).toBe(Methods.Get);
			expect(typeof startTimestamp).toBe('number');
			expect(typeof endTimestamp).toBe('number');
			expect(data).toBe('test');
		});
	});
});
