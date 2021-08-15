import { Method } from '../../../types';
import { FilterByDataPayload, FilterByHookPayload, FilterPayload, Payload } from '../../payloads';

export function isFilterByDataPayload<Value = unknown>(payload: FilterPayload<Value>): payload is FilterByDataPayload<Value> {
	return payload.type === Payload.Type.Data && payload.method === Method.Filter;
}

export function isFilterByHookPayload<Value = unknown>(payload: FilterPayload<Value>): payload is FilterByHookPayload<Value> {
	return payload.type === Payload.Type.Hook && payload.method === Method.Filter;
}
