import { EveryByHookPayload, EveryByValuePayload, EveryPayload, Payload } from '../../../payloads';
import { Method } from '../../../types';

/**
 * Validates whether the given payload is {@link EveryByHookPayload}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isEveryByHookPayload<HookValue>(payload: EveryPayload<HookValue>): payload is EveryByHookPayload<HookValue> {
  return payload.method === Method.Every && payload.type === Payload.Type.Hook;
}

/**
 * Validates whether the given payload is {@link EveryByValuePayload}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isEveryByValuePayload<HookPayload>(payload: EveryPayload<HookPayload>): payload is EveryByValuePayload {
  return payload.method === Method.Every && payload.type === Payload.Type.Value;
}
