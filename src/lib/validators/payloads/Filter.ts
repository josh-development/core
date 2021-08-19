import { FilterByDataPayload, FilterByHookPayload, FilterPayload, Payload } from '../../payloads';
import { Method } from '../../types';

/**
 * Checks whether the given payload is a {@link FilterByDataPayload}
 * @since 2.0.0
 * @param payload The payload to check
 * @returns Whether the check is `true` or `false`
 */
export function isFilterByDataPayload<Value = unknown>(payload: FilterPayload<Value>): payload is FilterByDataPayload<Value> {
	return payload.type === Payload.Type.Data && payload.method === Method.Filter;
}

/**
 * Checks whether the given payload is a {@link FilterByHookPayload}
 * @since 2.0.0
 * @param payload The payload to check
 * @returns Whether the check is `true` or `false`
 */
export function isFilterByHookPayload<Value = unknown>(payload: FilterPayload<Value>): payload is FilterByHookPayload<Value> {
	return payload.type === Payload.Type.Hook && payload.method === Method.Filter;
}
