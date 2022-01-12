import type { Josh } from '../structures/Josh';

export function convertLegacyExportJSON<StoredValue>(json: Josh.LegacyExportJSON<StoredValue>): Josh.ExportJSON<StoredValue> {
	const { name, version, exportDate, keys } = json;

	return { name, version, exportedTimestamp: exportDate, entries: keys.map<[string, StoredValue]>(({ key, value }) => [key, value]) };
}
