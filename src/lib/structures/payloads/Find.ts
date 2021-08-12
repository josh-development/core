import type { Awaited } from '@sapphire/utilities';
import type { Payload } from './Payload';

export interface FindByDataPayload<Value = unknown> extends Payload, Payload.OptionalData<Value> {
	inputData: Value;
	path?: string[];
}

export interface FindByHookPayload<Value = unknown> extends Payload, Payload.OptionalData<Value> {
	inputHook: FindHook<Value>;
	path?: string[];
}

export type FindHook<Value = unknown> = (data: Value) => Awaited<Value>;

export type FindPayload<Value> = FindByDataPayload<Value> | FindByHookPayload<Value>;
