import { CommonIdentifiers } from '../types';

export function resolveCommonIdentifier(identifier: string, metadata: Record<string, unknown>): string | null {
  switch (identifier) {
    case CommonIdentifiers.InvalidCount:
      return 'The "count" of items must be less than or equal to the amount of items in the provider.';

    case CommonIdentifiers.InvalidDataType: {
      const { key, path = [], type } = metadata;

      if (typeof key === 'string') return null;
      if (!Array.isArray(path)) return null;
      if (typeof type !== 'string') return null;

      return path.length === 0
        ? `The data at "${key}" is invalid. Expected type: ${type.toUpperCase()}`
        : `The data at "${key}.${path.join('.')}" is invalid. Expected type: ${type.toUpperCase()}`;
    }

    case CommonIdentifiers.InvalidValueType: {
      const { type } = metadata;

      if (typeof type !== 'string') return null;

      return `The "value" parameter is invalid. Expected type: ${type.toUpperCase()}`;
    }

    case CommonIdentifiers.MissingData: {
      const { key, path = [] } = metadata;

      if (typeof key === 'string') return null;
      if (!Array.isArray(path)) return null;

      return path.length === 0 ? `The data at "${key}" does not exist.` : `The data at "${key}.${path.join('.')}" does not exist.`;
    }

    case CommonIdentifiers.MissingValue:
      return 'The "value" parameter was not found.';

    default:
      return null;
  }
}
