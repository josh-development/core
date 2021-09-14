import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The payload for {@link Method.Has}
 * @see {@link Payload}
 * @see {@link Payload.KeyPath}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface HasPayload extends Payload, Payload.KeyPath, Payload.Data<boolean> {
	/**
	 * The method this payload is for.
	 * @since 2.0.0
	 */
	method: Method.Has;
}
