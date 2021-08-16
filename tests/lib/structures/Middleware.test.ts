import { Middleware } from '../../../src';

describe('Middleware class', () => {
	test('GIVEN typeof Middleware THEN returns function', () => {
		expect(typeof Middleware).toBe('function');
	});

	test('GIVEN typeof Middleware.prototype THEN returns object', () => {
		expect(typeof Middleware.prototype).toBe('object');
	});
});
