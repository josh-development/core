import { MiddlewareStore } from '../../../src';

describe('MiddlewareStore', () => {
	describe('is a class', () => {
		test('GIVEN typeof MiddlewareStore THEN returns function', () => {
			expect(typeof MiddlewareStore).toBe('function');
		});

		test('GIVEN typeof ...prototype THEN returns object', () => {
			expect(typeof MiddlewareStore.prototype).toBe('object');
		});
	});
});
