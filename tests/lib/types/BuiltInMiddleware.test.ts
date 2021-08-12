import { BuiltInMiddleware } from '../../../src';

describe('BuiltInMiddleware enum', () => {
	test('GIVEN AutoEnsure THEN returns string for AutoEnsure', () => {
		expect(BuiltInMiddleware.AutoEnsure).toBe('autoEnsure');
	});
});
