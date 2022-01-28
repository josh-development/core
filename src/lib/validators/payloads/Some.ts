import { Payload, SomeByHookPayload, SomeByValuePayload, SomePayload } from '../../payloads';
import { Method } from '../../types';

/**
 * Validates whether the given payload is {@link SomeByHookPayload}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isSomeByHookPayload<HookValue>(payload: SomePayload<HookValue>): payload is SomeByHookPayload<HookValue> {
  return payload.method === Method.Some && payload.type === Payload.Type.Hook;
}

/**
 * Validates whether the given payload is {@link SomeByValuePayload}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isSomeByValuePayload<HookValue>(payload: SomePayload<HookValue>): payload is SomeByValuePayload {
  return payload.method === Method.Some && payload.type === Payload.Type.Value;
}
