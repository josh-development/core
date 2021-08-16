import { MiddlewareStore } from '../../../src';

describe('MiddlewareStore class', () => {
	test('GIVEN typeof MiddlewareStore THEN returns function', () => {
		expect(typeof MiddlewareStore).toBe('function');
	});

	test('GIVEN typeof MiddlewareStore.prototype THEN returns object', () => {
		expect(typeof MiddlewareStore.prototype).toBe('object');
	});
});
