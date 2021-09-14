import type { Method, StringArray } from '../types';
import type { Payload } from './Payload';

/**
 * The payload for {@link Method.SetMany}
 * @see {@link Payload}
 * @since 2.0.0
 */
export interface SetManyPayload<Value> extends Payload {
	/**
	 * The method this payload is for.
	 * @since 2.0.0
	 */
	method: Method.SetMany;

	/**
	 * The keys to set.
	 * @since 2.0.0
	 */
	keys: StringArray;

	/**
	 * The value to set at each key.
	 * @since 2.0.0
	 */
	value: Value;
}
