import { Middleware } from '../../../src';

describe('Middleware', () => {
	describe('is a class', () => {
		test('GIVEN typeof Middleware THEN returns function', () => {
			expect(typeof Middleware).toBe('function');
		});

		test('GIVEN typeof ...prototype THEN returns object', () => {
			expect(typeof Middleware.prototype).toBe('object');
		});
	});
});
