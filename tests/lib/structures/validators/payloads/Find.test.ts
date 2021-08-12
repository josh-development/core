import { isFindByDataPayload, isFindByHookPayload, Method, Payload, UpdateByDataPayload, UpdateByHookPayload } from '../../../../../src';

describe('Validator functions', () => {
	test('GIVEN isFindByDataPayload() THEN returns true', () => {
		const payload: UpdateByDataPayload = { method: Method.Find, type: Payload.Type.Data, key: 'test', inputData: 'test' };

		expect(isFindByDataPayload(payload)).toBe(true);
	});

	test('GIVEN isFindByDataPayload() THEN returns false', () => {
		const payload: UpdateByHookPayload = { method: Method.Find, type: Payload.Type.Hook, key: 'test', inputHook: (data) => data === 'test' };

		expect(isFindByDataPayload(payload)).toBe(false);
	});

	test('GIVEN isFindByHookPayload() THEN returns true', () => {
		const payload: UpdateByHookPayload = { method: Method.Find, type: Payload.Type.Hook, key: 'test', inputHook: (data) => data === 'test' };

		expect(isFindByHookPayload(payload)).toBe(true);
	});

	test('GIVEN isFindByHookPayload() THEN returns false', () => {
		const payload: UpdateByDataPayload = { method: Method.Find, type: Payload.Type.Data, key: 'test', inputData: 'test' };

		expect(isFindByHookPayload(payload)).toBe(false);
	});
});
