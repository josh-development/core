import type { KeyPathArray, Method } from '../types';
import type { Payload } from './Payload';

/**
 * The payload for {@link Method.SetMany}
 * @see {@link Payload}
 * @since 2.0.0
 */
export interface SetManyPayload extends Payload {
	/**
	 * The method for this payload.
	 * @since 2.0.0
	 */
	method: Method.SetMany;

	/**
	 * The key/paths for this payload.
	 * @since 2.0.0
	 */
	keyPaths: KeyPathArray[];
}
