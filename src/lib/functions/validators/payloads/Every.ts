import { Method, Payload, Payloads } from '../../../types';

/**
 * Validates whether the given payload is {@link Payloads.Every.ByHook}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isEveryByHookPayload<StoredValue>(payload: Payloads.Every<StoredValue>): payload is Payloads.Every.ByHook<StoredValue> {
  return payload.method === Method.Every && payload.type === Payload.Type.Hook;
}

/**
 * Validates whether the given payload is {@link Payloads.Every.ByValue}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isEveryByValuePayload<StoredPayload>(payload: Payloads.Every<StoredPayload>): payload is Payloads.Every.ByValue {
  return payload.method === Method.Every && payload.type === Payload.Type.Value;
}
