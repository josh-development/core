import type { Awaited } from '@sapphire/utilities';
import type { Payload } from './Payload';

export interface UpdateByDataPayload<Value = unknown> extends Payload, Payload.KeyPath, Partial<Payload.Data<Value>> {
	inputData?: Value;
}

export interface UpdateByHookPayload<Value = unknown> extends Payload, Payload.KeyPath, Partial<Payload.Data<Value>> {
	inputHook?: UpdateHook<Value>;
}

export type UpdateHook<Value = unknown> = (currentData: Value) => Awaited<Value>;

export type UpdatePayload<Value = unknown> = UpdateByDataPayload<Value> | UpdateByHookPayload<Value>;
