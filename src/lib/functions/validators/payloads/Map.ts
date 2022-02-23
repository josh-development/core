import { Method, Payload, Payloads } from '../../../types';

/**
 * Validates whether the given payload is {@link Payloads.Map.ByHook}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isMapByHookPayload<StoredValue, ReturnValue>(
  payload: Payloads.Map<StoredValue, ReturnValue>
): payload is Payloads.Map.ByHook<StoredValue, ReturnValue> {
  return payload.method === Method.Map && payload.type === Payload.Type.Hook;
}

/**
 * Validates whether the given payload is {@link Payloads.Map.ByValue}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isMapByPathPayload<StoredValue, ReturnValue>(
  payload: Payloads.Map<StoredValue, ReturnValue>
): payload is Payloads.Map.ByPath<ReturnValue> {
  return payload.method === Method.Map && payload.type === Payload.Type.Path;
}
