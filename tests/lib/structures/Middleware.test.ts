import { Middleware } from '../../../src';

describe('Middleware class', () => {
	test('GIVEN typeof Middleware THEN returns function', () => {
		expect(typeof Middleware).toBe('function');
	});
});
