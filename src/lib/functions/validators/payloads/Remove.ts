import { Method, Payload, Payloads } from '../../../types';

/**
 * Validates whether the given payload is {@link Payloads.Remove.ByHook}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isRemoveByHookPayload<Value>(payload: Payloads.Remove<Value>): payload is Payloads.Remove.ByHook<Value> {
  return payload.method === Method.Remove && payload.type === Payload.Type.Hook;
}

/**
 * Validates whether the given payload is {@link Payloads.Remove.ByValue}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isRemoveByValuePayload<Value>(payload: Payloads.Remove<Value>): payload is Payloads.Remove.ByValue {
  return payload.method === Method.Remove && payload.type === Payload.Type.Value;
}
