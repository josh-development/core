import type { Awaited } from '@sapphire/utilities';
import type { Payload } from './Payload';

export interface FindPayload<Value = unknown> extends Payload, Payload.OptionalData<Value> {
	type: Payload.Type;
	inputData?: Value;
	inputHook?: FindHook<Value>;
	path?: string[];
}

export interface FindByDataPayload<Value = unknown> extends Payload, Payload.ByData, Payload.OptionalData<Value> {
	inputData: Value;
	path?: string[];
}

export interface FindByHookPayload<Value = unknown> extends Payload, Payload.ByHook, Payload.OptionalData<Value> {
	inputHook: FindHook<Value>;
	path?: string[];
}

export type FindHook<Value = unknown> = (data: Value) => Awaited<boolean>;
