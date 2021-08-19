import { Payload, UpdateByDataPayload, UpdateByHookPayload, UpdatePayload } from '../../payloads';
import { Method } from '../../types';

/**
 * Checks whether the given payload is a {@link UpdateByDataPayload}
 * @since 2.0.0
 * @param payload The payload to check
 * @returns Whether the check is `true` or `false`
 */
export function isUpdateByDataPayload<Value = unknown>(payload: UpdatePayload<Value>): payload is UpdateByDataPayload<Value> {
	return payload.type === Payload.Type.Data && payload.method === Method.Update;
}

/**
 * Checks whether the given payload is a {@link UpdateByHookPayload}
 * @since 2.0.0
 * @param payload The payload to check
 * @returns Whether the check is `true` or `false`
 */
export function isUpdateByHookPayload<Value = unknown>(payload: UpdatePayload<Value>): payload is UpdateByHookPayload<Value> {
	return payload.type === Payload.Type.Hook && payload.method === Method.Update;
}
