import { Josh } from '../../../src';

describe('Josh class', () => {
	describe('Static properties and methods', () => {
		test('GIVEN multi() THEN returns Josh instances', () => {
			const { test } = Josh.multi(['test']);

			expect(test).toBeInstanceOf(Josh);
		});
	});
});
