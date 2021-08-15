import { FilterByDataPayload, FilterByHookPayload, isFilterByDataPayload, isFilterByHookPayload, Method, Payload } from '../../../../../src';

describe('Validator functions', () => {
	test('GIVEN isFilterByDataPayload() THEN returns true', () => {
		const payload: FilterByDataPayload = { method: Method.Filter, type: Payload.Type.Data, inputData: 'test', data: {} };

		expect(isFilterByDataPayload(payload)).toBe(true);
	});

	test('GIVEN isFilterByDataPayload() THEN returns false', () => {
		const payload: FilterByHookPayload = { method: Method.Filter, type: Payload.Type.Hook, inputHook: (data) => data === 'test', data: {} };

		expect(isFilterByDataPayload(payload)).toBe(false);
	});

	test('GIVEN isFilterByHookPayload() THEN returns true', () => {
		const payload: FilterByHookPayload = { method: Method.Filter, type: Payload.Type.Hook, inputHook: (data) => data === 'test', data: {} };

		expect(isFilterByHookPayload(payload)).toBe(true);
	});

	test('GIVEN isFilterByHookPayload() THEN returns false', () => {
		const payload: FilterByDataPayload = { method: Method.Filter, type: Payload.Type.Data, inputData: 'test', data: {} };

		expect(isFilterByHookPayload(payload)).toBe(false);
	});
});
