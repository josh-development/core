import type { Awaited } from '@sapphire/utilities';
import type { Method } from '../types';
import type { Payload } from './Payload';

export interface FindPayload<Value = unknown> extends Payload, Payload.OptionalData<Value> {
	method: Method.Find;

	type: Payload.Type;

	inputData?: Value;

	inputHook?: FindHook<Value>;

	path?: string[];
}

export interface FindByDataPayload<Value = unknown> extends Payload, Payload.ByData, Payload.OptionalData<Value> {
	method: Method.Find;

	inputData: Value;

	path?: string[];
}

export interface FindByHookPayload<Value = unknown> extends Payload, Payload.ByHook, Payload.OptionalData<Value> {
	method: Method.Find;

	inputHook: FindHook<Value>;

	path?: string[];
}

export type FindHook<Value = unknown> = (data: Value) => Awaited<boolean>;
