import type { Awaited } from '@sapphire/utilities';
import type { Payload } from './Payload';

export interface SomePayload<Value = unknown> extends Payload, Payload.Data<boolean> {
	type: Payload.Type;

	inputData?: Value;

	inputHook?: SomeHook<Value>;

	path?: string[];
}

export interface SomeByDataPayload<Value = unknown> extends Payload, Payload.ByData, Payload.Data<boolean> {
	inputData: Value;

	path?: string[];
}

export interface SomeByHookPayload<Value = unknown> extends Payload, Payload.ByHook, Payload.Data<boolean> {
	inputHook: SomeHook<Value>;

	path?: string[];
}

export type SomeHook<Value = unknown> = (data: Value) => Awaited<boolean>;
