import { FilterByHookPayload, FilterByValuePayload, FilterPayload, Payload } from '../../payloads';
import { Method } from '../../types';

/**
 * Validates whether the given payload is {@link FilterByHookPayload}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isFilterByHookPayload<DataValue>(payload: FilterPayload<DataValue>): payload is FilterByHookPayload<DataValue> {
  return payload.method === Method.Filter && payload.type === Payload.Type.Hook;
}

/**
 * Validates whether the given payload is {@link FilterByValuePayload}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isFilterByValuePayload<DataValue>(payload: FilterPayload<DataValue>): payload is FilterByValuePayload<DataValue> {
  return payload.method === Method.Filter && payload.type === Payload.Type.Value;
}
