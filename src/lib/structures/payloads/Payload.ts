import type { Stopwatch } from '@sapphire/stopwatch';
import type { Method, Trigger } from '../../types';

export interface Payload {
	method: Method;
	trigger?: Trigger;
	stopwatch?: Stopwatch;
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
}
