import { Middleware } from '../../../src';

describe('Middleware', () => {
	test('GIVEN typeof Middleware THEN returns function', () => {
		expect(typeof Middleware).toBe('function');
	});
});
