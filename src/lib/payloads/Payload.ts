import type { Stopwatch } from '@sapphire/stopwatch';
import type { JoshProviderError } from '../errors';
import type { Method, Trigger } from '../types';

export interface Payload {
	method: Method;

	trigger?: Trigger;

	stopwatch?: Stopwatch;

	error?: JoshProviderError;
}

export namespace Payload {
	export interface KeyPath {
		key: string;

		path?: string[];
	}

	export interface Data<Value = unknown> {
		data: Value;
	}

	export type OptionalData<Value = unknown> = Partial<Data<Value>>;

	export interface ByData {
		type: Type.Data;
	}

	export interface ByHook {
		type: Type.Hook;
	}

	export enum Type {
		Data = 'DATA',

		Hook = 'HOOK'
	}
}
