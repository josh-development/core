import type { Stopwatch } from '@sapphire/stopwatch';
import type { JoshProviderError } from '../errors';
import type { Method, Trigger } from '../types';

/**
 * The base payload to use for most Josh structures.
 * @since 2.0.0
 */
export interface Payload {
	/**
	 * The method for this payload.
	 * @since 2.0.0
	 */
	method: Method;

	/**
	 * The trigger for this payload.
	 * @since 2.0.0
	 */
	trigger?: Trigger;

	/**
	 * The stopwatch to be used in the provider.
	 * @since 2.0.0
	 */
	stopwatch?: Stopwatch;

	/**
	 * The error for this payload.
	 * @since 2.0.0
	 */
	error?: JoshProviderError;
}

export namespace Payload {
	/**
	 * The key/path extension for {@link Payload}.
	 * @since 2.0.0
	 */
	export interface KeyPath {
		/**
		 * The key for this extension.
		 * @since 2.0.0
		 */
		key: string;

		/**
		 * The path for this extension.
		 * @since 2.0.0
		 */
		path?: string[];
	}

	/**
	 * The data extension for {@link Payload}.
	 * @since 2.0.0
	 */
	export interface Data<Value = unknown> {
		/**
		 * The data for this extension.
		 * @since 2.0.0
		 */
		data: Value;
	}

	/**
	 * The optional data extension for {@link Payload}.
	 * @since 2.0.0
	 */
	export type OptionalData<Value = unknown> = Partial<Data<Value>>;

	/**
	 * The byData extension for {@link Payload}.
	 * @since 2.0.0
	 */
	export interface ByData {
		/**
		 * The type for this extension.
		 * @since 2.0.0
		 */
		type: Type.Data;
	}

	/**
	 * The byHook extension for {@link Payload}
	 * @since 2.0.0
	 */
	export interface ByHook {
		/**
		 * The type for this extension.
		 * @since 2.0.0
		 */
		type: Type.Hook;
	}

	/**
	 * The type enum for {@link Payload}.
	 * @since 2.0.0
	 */
	export enum Type {
		/**
		 * The data type.
		 * @since 2.0.0
		 */
		Data = 'DATA',

		/**
		 * The hook type.
		 * @since 2.0.0
		 */
		Hook = 'HOOK'
	}
}
