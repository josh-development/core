import type { Method, StringArray } from '../types';
import type { Payload } from './Payload';

/**
 * The payload for {@link Method.SetMany}
 * @see {@link Payload}
 * @since 2.0.0
 */
export interface SetManyPayload<Value> extends Payload, Payload.Data<[SetManyPayload.KeyPath, Value][]> {
	/**
	 * The method this payload is for.
	 * @since 2.0.0
	 */
	method: Method.SetMany;
}

export namespace SetManyPayload {
	/**
	 * The key/path data for {@link SetManyPayload}.
	 * @since 2.0.0
	 */
	export interface KeyPath {
		/**
		 * The key to set.
		 * @since 2.0.0
		 */
		key: string;

		/**
		 * The path to set at.
		 * @since 2.0.0
		 */
		path: StringArray;
	}
}
