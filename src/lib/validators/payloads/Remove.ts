import { Payload, RemoveByHookPayload, RemoveByValuePayload, RemovePayload } from '../../payloads';
import { Method } from '../../types';

/**
 * Validates whether the given payload is {@link RemoveByHookPayload}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isRemoveByHookPayload<HookValue>(payload: RemovePayload<HookValue>): payload is RemoveByHookPayload<HookValue> {
  return payload.method === Method.Remove && payload.type === Payload.Type.Hook;
}

/**
 * Validates whether the given payload is {@link RemoveByValuePayload}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isRemoveByValuePayload<HookValue>(payload: RemovePayload<HookValue>): payload is RemoveByValuePayload {
  return payload.method === Method.Remove && payload.type === Payload.Type.Value;
}
