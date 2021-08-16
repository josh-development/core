import { JoshProviderError } from '../../../src';

describe('JoshProviderError class', () => {
	test('GIVEN typeof JoshProviderError THEN returns function', () => {
		expect(typeof JoshProviderError).toBe('function');
	});

	test('GIVEN typeof JoshProviderError.prototype THEN returns object', () => {
		expect(typeof JoshProviderError.prototype).toBe('object');
	});
});
