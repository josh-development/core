import { Method, Payload, Payloads } from '../../../types';

/**
 * Validates whether the given payload is {@link Payloads.Find.ByHook}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isFindByHookPayload<StoredValue>(payload: Payloads.Find<StoredValue>): payload is Payloads.Find.ByHook<StoredValue> {
  return payload.method === Method.Find && payload.type === Payload.Type.Hook;
}

/**
 * Validates whether the given payload is {@link Payloads.Find.ByValue}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isFindByValuePayload<StoredValue>(payload: Payloads.Find<StoredValue>): payload is Payloads.Find.ByValue<StoredValue> {
  return payload.method === Method.Find && payload.type === Payload.Type.Value;
}
