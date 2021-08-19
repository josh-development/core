import { Payload, SomeByDataPayload, SomeByHookPayload, SomePayload } from '../../payloads';
import { Method } from '../../types';

/**
 * Checks whether the given payload is a {@link SomeByDataPayload}
 * @since 2.0.0
 * @param payload The payload to check
 * @returns Whether the check is `true` or `false`
 */
export function isSomeByDataPayload<Value = unknown>(payload: SomePayload<Value>): payload is SomeByDataPayload<Value> {
	return payload.type === Payload.Type.Data && payload.method === Method.Some;
}

/**
 * Checks whether the given payload is a {@link SomeByHookPayload}
 * @since 2.0.0
 * @param payload The payload to check
 * @returns Whether the check is `true` or `false`
 */
export function isSomeByHookPayload<Value = unknown>(payload: SomePayload<Value>): payload is SomeByHookPayload<Value> {
	return payload.type === Payload.Type.Hook && payload.method === Method.Some;
}
