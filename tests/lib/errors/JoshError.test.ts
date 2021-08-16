import { JoshError } from '../../../src';

describe('JoshError class', () => {
	test('GIVEN typeof JoshError THEN returns function', () => {
		expect(typeof JoshError).toBe('function');
	});

	test('GIVEN typeof JoshError.prototype THEN returns object', () => {
		expect(typeof JoshError.prototype).toBe('object');
	});
});
