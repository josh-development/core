import type { Awaited } from '@sapphire/utilities';
import type { Method } from '../types';
import type { Payload } from './Payload';

export interface SomePayload<Value = unknown> extends Payload, Payload.Data<boolean> {
	method: Method.Some;

	type: Payload.Type;

	inputData?: Value;

	inputHook?: SomeHook<Value>;

	path?: string[];
}

export interface SomeByDataPayload<Value = unknown> extends Payload, Payload.ByData, Payload.Data<boolean> {
	method: Method.Some;

	inputData: Value;

	path?: string[];
}

export interface SomeByHookPayload<Value = unknown> extends Payload, Payload.ByHook, Payload.Data<boolean> {
	method: Method.Some;

	inputHook: SomeHook<Value>;

	path?: string[];
}

export type SomeHook<Value = unknown> = (data: Value) => Awaited<boolean>;
