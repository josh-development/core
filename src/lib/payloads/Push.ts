import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The payload for {@link Method.Push}
 * @see {@link Payload}
 * @see {@link Payload.KeyPath}
 * @since 2.0.0
 */
export interface PushPayload<Value> extends Payload, Payload.KeyPath {
	/**
	 * The method this payload is for.
	 * @since 2.0.0
	 */
	method: Method.Push;

	/**
	 * The value to push to an array.
	 * @since 2.0.0
	 */
	value: Value;
}
