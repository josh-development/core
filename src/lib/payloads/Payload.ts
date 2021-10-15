import type { JoshProviderError } from '../errors';
import type { Method, StringArray, Trigger } from '../types';

/**
 * The base payload to use for most Josh structures.
 * @since 2.0.0
 */
export interface Payload {
	/**
	 * The method this payload is for.
	 * @since 2.0.0
	 */
	method: Method;

	/**
	 * The trigger for this payload.
	 * @since 2.0.0
	 */
	trigger?: Trigger;

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
		path: StringArray;
	}

	/**
	 * The data extension for {@link Payload}.
	 * @since 2.0.0
	 */
	export interface Data<DataValue> {
		/**
		 * The data for this extension.
		 * @since 2.0.0
		 */
		data: DataValue;
	}

	/**
	 * The optional data extension for {@link Payload}.
	 * @see {@link Data}
	 * @since 2.0.0
	 */
	export type OptionalData<DataValue> = Partial<Data<DataValue>>;

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
	 * The byPath extension for {@link Payload}
	 */
	export interface ByPath {
		/**
		 * The type for this extension
		 * @since 2.0.0
		 */
		type: Type.Path;
	}

	/**
	 * The byValue extension for {@link Payload}.
	 * @since 2.0.0
	 */
	export interface ByValue {
		/**
		 * The type for this extension.
		 * @since 2.0.0
		 */
		type: Type.Value;
	}

	/**
	 * The byPath extension for {@link Payload}
	 */
	export interface ByPath {
		/**
		 * The type for this extension
		 * @since 2.0.0
		 */
		type: Type.Path;
	}

	/**
	 * The type enum for {@link Payload}.
	 * @see {@link ByHook}
	 * @see {@link ByPath}
	 * @see {@link ByValue}
	 * @since 2.0.0
	 */
	export enum Type {
		/**
		 * The hook type.
		 * @since 2.0.0
		 */
		Hook = 'HOOK',

		/**
		 * The path type.
		 * @since 2.0.0
		 */
		Path = 'PATH',

		/**
		 * The value type.
		 * @since 2.0.0
		 */
		Value = 'VALUE'
	}
}
