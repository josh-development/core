import { FindByDataPayload, FindByHookPayload, FindPayload, Payload } from '../../payloads';
import { Method } from '../../types';

/**
 * Checks whether the given payload is a {@link FindByDataPayload}
 * @since 2.0.0
 * @param payload The payload to check
 * @returns Whether the check is `true` or `false`
 */
export function isFindByDataPayload<Value = unknown>(payload: FindPayload<Value>): payload is FindByDataPayload<Value> {
	return payload.type === Payload.Type.Data && payload.method === Method.Find;
}

/**
 * Checks whether the given payload is a {@link FindByHookPayload}
 * @since 2.0.0
 * @param payload The payload to check
 * @returns Whether the check is `true` or `false`
 */
export function isFindByHookPayload<Value = unknown>(payload: FindPayload<Value>): payload is FindByHookPayload<Value> {
	return payload.type === Payload.Type.Hook && payload.method === Method.Find;
}
