import { Josh, MapProvider } from '../../../src';

describe('Josh class', () => {
	describe('Static properties and methods', () => {
		test('GIVEN defaultProvider THEN returns MapProvider', () => {
			expect(Josh.defaultProvider).toBe(MapProvider);
		});

		test('GIVEN multi() THEN returns Josh instances', () => {
			const { test } = Josh.multi(['test']);

			expect(test).toBeInstanceOf(Josh);
		});
	});
});
