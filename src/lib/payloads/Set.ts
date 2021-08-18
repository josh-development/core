import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The {@link Payload} for `set` using {@link Payload.KeyPath}
 * @since 2.0.0
 */
export interface SetPayload extends Payload, Payload.KeyPath {
	/**
	 * The method for this payload.
	 * @since 2.0.0
	 */
	method: Method.Set;
}
