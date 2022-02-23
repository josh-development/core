import { Method, Payload, Payloads } from '../../../types';

/**
 * Validates whether the given payload is {@link SomeByHookPayload}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isSomeByHookPayload<StoredValue>(payload: Payloads.Some<StoredValue>): payload is Payloads.Some.ByHook<StoredValue> {
  return payload.method === Method.Some && payload.type === Payload.Type.Hook;
}

/**
 * Validates whether the given payload is {@link SomeByValuePayload}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isSomeByValuePayload<StoredValue>(payload: Payloads.Some<StoredValue>): payload is Payloads.Some.ByValue {
  return payload.method === Method.Some && payload.type === Payload.Type.Value;
}
