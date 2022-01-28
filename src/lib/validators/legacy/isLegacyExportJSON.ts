import type { Josh } from '../../structures/Josh';

export function isLegacyExportJSON<StoredValue>(
  json: Josh.ExportJSON<StoredValue> | Josh.LegacyExportJSON<StoredValue>
): json is Josh.LegacyExportJSON<StoredValue> {
  return 'exportDate' in json && 'keys' in json;
}
