import { convertLegacyExportJSON } from '../../../src';

describe('convertLegacyExportJSON', () => {
	describe('is a function', () => {
		test('GIVEN typeof ... THEN returns function', () => {
			expect(typeof convertLegacyExportJSON).toBe('function');
		});
	});

	describe('converts legacy json properly', () => {
		test('GIVEN legacy json THEN converts json', () => {
			const exportedTimestamp = Date.now();

			expect(
				convertLegacyExportJSON({ name: 'test', version: '1.0.0', exportDate: exportedTimestamp, keys: [{ key: 'key', value: 'value' }] })
			).toEqual({
				name: 'test',
				version: '1.0.0',
				exportedTimestamp,
				entries: [['key', 'value']]
			});
		});
	});
});
