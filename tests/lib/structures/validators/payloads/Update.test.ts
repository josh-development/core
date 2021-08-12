import { isUpdateByDataPayload, isUpdateByHookPayload, Method, Payload, UpdateByDataPayload, UpdateByHookPayload } from '../../../../../src';

describe('Validators', () => {
	test('GIVEN isUpdateByDataPayload() THEN returns true', () => {
		const payload: UpdateByDataPayload = { method: Method.Update, type: Payload.Type.Data, key: 'test', inputData: 'test' };

		expect(isUpdateByDataPayload(payload)).toBe(true);
	});

	test('GIVEN isUpdateByDataPayload() THEN returns false', () => {
		const payload: UpdateByHookPayload = { method: Method.Update, type: Payload.Type.Hook, key: 'test', inputHook: (data) => data === 'test' };

		expect(isUpdateByDataPayload(payload)).toBe(false);
	});

	test('GIVEN isUpdateByHookPayload() THEN returns true', () => {
		const payload: UpdateByHookPayload = { method: Method.Update, type: Payload.Type.Hook, key: 'test', inputHook: (data) => data === 'test' };

		expect(isUpdateByHookPayload(payload)).toBe(true);
	});

	test('GIVEN isUpdateByHookPayload() THEN returns false', () => {
		const payload: UpdateByDataPayload = { method: Method.Update, type: Payload.Type.Data, key: 'test', inputData: 'test' };

		expect(isUpdateByHookPayload(payload)).toBe(false);
	});
});
