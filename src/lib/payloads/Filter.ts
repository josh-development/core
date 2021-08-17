import type { Awaited } from '@sapphire/utilities';
import type { Payload } from './Payload';

export interface FilterPayload<Value = unknown> extends Payload, Payload.OptionalData<Record<string, Value | null>> {
	type: Payload.Type;

	inputData?: Value;

	inputHook?: FilterHook<Value>;

	path?: string[];
}

export interface FilterByDataPayload<Value = unknown> extends Payload, Payload.ByData, Payload.Data<Record<string, Value | null>> {
	inputData: Value;

	path?: string[];
}

export interface FilterByHookPayload<Value = unknown> extends Payload, Payload.ByHook, Payload.Data<Record<string, Value | null>> {
	inputHook: FilterHook<Value>;

	path?: string[];
}

export type FilterHook<Value = unknown> = (data: Value) => Awaited<Value>;