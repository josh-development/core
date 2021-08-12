import { Method } from '../../../src';

describe('Method enum', () => {
	test('GIVEN AutoKey THEN returns string for AutoKey', () => {
		expect(Method.AutoKey).toBe('autoKey');
	});

	test('GIVEN Ensure THEN returns string for Ensure', () => {
		expect(Method.Ensure).toBe('ensure');
	});

	test('GIVEN Find THEN returns string for Find', () => {
		expect(Method.Find).toBe('find');
	});

	test('GIVEN Get THEN returns string for Get', () => {
		expect(Method.Get).toBe('get');
	});

	test('GIVEN GetAll THEN returns string for GetAll', () => {
		expect(Method.GetAll).toBe('getAll');
	});

	test('GIVEN GetMany THEN returns string for GetMany', () => {
		expect(Method.GetMany).toBe('getMany');
	});

	test('GIVEN Has THEN returns string for Has', () => {
		expect(Method.Has).toBe('has');
	});

	test('GIVEN Keys THEN returns string for Keys', () => {
		expect(Method.Keys).toBe('keys');
	});

	test('GIVEN Random THEN returns string for Random', () => {
		expect(Method.Random).toBe('random');
	});

	test('GIVEN Set THEN returns string for Set', () => {
		expect(Method.Set).toBe('set');
	});

	test('GIVEN SetMany THEN returns string for SetMany', () => {
		expect(Method.SetMany).toBe('setMany');
	});

	test('GIVEN Size THEN returns string for Size', () => {
		expect(Method.Size).toBe('size');
	});

	test('GIVEN Update THEN returns string for Update', () => {
		expect(Method.Update).toBe('update');
	});

	test('GIVEN Values THEN returns string for Values', () => {
		expect(Method.Values).toBe('values');
	});
});
