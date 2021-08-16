import { Trigger } from '../../../src';

describe('Trigger enum', () => {
	test('GIVEN PreProvider THEN returns number for PreProvider', () => {
		expect(Trigger.PreProvider).toBe(0);
	});

	test('GIVEN PostProvider THEN returns number for PostProvider', () => {
		expect(Trigger.PostProvider).toBe(1);
	});
});
