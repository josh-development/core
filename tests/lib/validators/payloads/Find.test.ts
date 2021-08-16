import { FindByDataPayload, FindByHookPayload, isFindByDataPayload, isFindByHookPayload, Method, Payload } from '../../../../src';

describe('Validator functions', () => {
	test('GIVEN isFindByDataPayload() THEN returns true', () => {
		const payload: FindByDataPayload = { method: Method.Find, type: Payload.Type.Data, inputData: 'test' };

		expect(isFindByDataPayload(payload)).toBe(true);
	});

	test('GIVEN isFindByDataPayload() THEN returns false', () => {
		const payload: FindByHookPayload = { method: Method.Find, type: Payload.Type.Hook, inputHook: (data) => data === 'test' };

		expect(isFindByDataPayload(payload)).toBe(false);
	});

	test('GIVEN isFindByHookPayload() THEN returns true', () => {
		const payload: FindByHookPayload = { method: Method.Find, type: Payload.Type.Hook, inputHook: (data) => data === 'test' };

		expect(isFindByHookPayload(payload)).toBe(true);
	});

	test('GIVEN isFindByHookPayload() THEN returns false', () => {
		const payload: FindByDataPayload = { method: Method.Find, type: Payload.Type.Data, inputData: 'test' };

		expect(isFindByHookPayload(payload)).toBe(false);
	});
});
