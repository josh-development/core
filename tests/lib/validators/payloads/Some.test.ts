import { isSomeByDataPayload, isSomeByHookPayload, Method, Payload, SomeByDataPayload, SomeByHookPayload } from '../../../../src';

describe('Validator functions', () => {
	test('GIVEN isSomeByDataPayload() THEN returns true', () => {
		const payload: SomeByDataPayload = { method: Method.Some, type: Payload.Type.Data, inputData: 'test', data: false };

		expect(isSomeByDataPayload(payload)).toBe(true);
	});

	test('GIVEN isSomeByDataPayload() THEN returns false', () => {
		const payload: SomeByHookPayload = { method: Method.Some, type: Payload.Type.Hook, inputHook: (data) => data === 'test', data: false };

		expect(isSomeByDataPayload(payload)).toBe(false);
	});

	test('GIVEN isSomeByHookPayload() THEN returns true', () => {
		const payload: SomeByHookPayload = { method: Method.Some, type: Payload.Type.Hook, inputHook: (data) => data === 'test', data: false };

		expect(isSomeByHookPayload(payload)).toBe(true);
	});

	test('GIVEN isSomeByHookPayload() THEN returns false', () => {
		const payload: SomeByDataPayload = { method: Method.Some, type: Payload.Type.Data, inputData: 'test', data: false };

		expect(isSomeByHookPayload(payload)).toBe(false);
	});
});
