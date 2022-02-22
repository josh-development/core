import { Method, Payload, Payloads } from '../../../types';

/**
 * Validates whether the given payload is {@link Payloads.Filter.ByHook}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isFilterByHookPayload<StoredValue>(payload: Payloads.Filter<StoredValue>): payload is Payloads.Filter.ByHook<StoredValue> {
  return payload.method === Method.Filter && payload.type === Payload.Type.Hook;
}

/**
 * Validates whether the given payload is {@link Payloads.Filter.ByValue}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isFilterByValuePayload<StoredValue>(payload: Payloads.Filter<StoredValue>): payload is Payloads.Filter.ByValue<StoredValue> {
  return payload.method === Method.Filter && payload.type === Payload.Type.Value;
}
