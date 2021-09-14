import { MapProviderError } from '../../../../src';

describe('MapProviderError', () => {
	describe('is a class', () => {
		test('GIVEN typeof MapProviderError THEN returns function', () => {
			expect(typeof MapProviderError).toBe('function');
		});

		test('GIVEN typeof ...prototype THEN returns object', () => {
			expect(typeof MapProviderError.prototype).toBe('object');
		});
	});
});
