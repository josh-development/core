import { get, set } from '../src';

describe('Utilities', () => {
	test('GIVEN get() THEN proper data', () => {
		expect(get({ a: 'b' }, '')).toEqual({ a: 'b' });
		expect(get({ a: 'b' }, 'a')).toBe('b');
		expect(get({ a: 'b' }, '[a]')).toBe('b');
		expect(get({ a: { b: 'c' } }, 'a.b')).toBe('c');
		expect(get({ a: { b: 'c' } }, 'a[b]')).toBe('c');
		expect(get({ a: { b: { c: ['d'] } } }, 'a.b.c')).toEqual(['d']);
		expect(get({ a: { b: { c: ['d'] } } }, 'a.b.c[0]')).toBe('d');
		expect(get({ a: { b: { c: ['d', ['e']] } } }, 'a.b.c[1]')).toEqual(['e']);
		expect(get({ a: { b: { c: ['d', ['e']] } } }, 'a.b.c[1][0]')).toBe('e');
		expect(get([{ a: 'b' }], '[0].a')).toBe('b');
		expect(get(['a', { b: 'c' }], '[1].b')).toBe('c');
		expect(get(['a', { b: { c: ['d'] } }], '[1].b.c')).toEqual(['d']);
	});

	test('GIVEN set() THEN proper data', () => {
		expect(set({}, 'a', 'b')).toEqual({ a: 'b' });
		expect(set({}, '[a]', 'b')).toEqual({ a: 'b' });
		expect(set({}, '[0]', 'a')).toEqual({ 0: 'a' });
		expect(set({ a: 'b' }, 'a.b', 'c')).toEqual({ a: { b: 'c' } });
		expect(set({ a: ['b'] }, 'a', 'b')).toEqual({ a: 'b' });
		expect(set([], '0', 'a')).toEqual(['a']);
		expect(set(['a'], '0', { a: 'b' })).toEqual([{ a: 'b' }]);
	});
});
