import type { Awaited } from '@sapphire/utilities';
import type { Payload } from './Payload';

export interface UpdatePayload<Value = unknown> extends Payload, Payload.KeyPath, Payload.OptionalData<Value> {
	type: Payload.Type;

	inputData?: Value;

	inputHook?: UpdateHook<Value>;
}

export interface UpdateByDataPayload<Value = unknown> extends Payload, Payload.ByData, Payload.KeyPath, Payload.OptionalData<Value> {
	inputData: Value;
}

export interface UpdateByHookPayload<Value = unknown> extends Payload, Payload.ByHook, Payload.KeyPath, Payload.OptionalData<Value> {
	inputHook: UpdateHook<Value>;
}

export type UpdateHook<Value = unknown> = (currentData: Value) => Awaited<Value>;
