import type { Awaited } from '@sapphire/utilities';
import type { Method } from '../types';
import type { Payload } from './Payload';

export interface UpdatePayload<Value = unknown> extends Payload, Payload.KeyPath, Payload.OptionalData<Value> {
	method: Method.Update;

	type: Payload.Type;

	inputData?: Value;

	inputHook?: UpdateHook<Value>;
}

export interface UpdateByDataPayload<Value = unknown> extends Payload, Payload.ByData, Payload.KeyPath, Payload.OptionalData<Value> {
	method: Method.Update;

	inputData: Value;
}

export interface UpdateByHookPayload<Value = unknown> extends Payload, Payload.ByHook, Payload.KeyPath, Payload.OptionalData<Value> {
	method: Method.Update;

	inputHook: UpdateHook<Value>;
}

export type UpdateHook<Value = unknown> = (currentData: Value) => Awaited<Value>;
