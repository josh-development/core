import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The payload for {@link Method.AutoKey}
 * @see {@link Payload}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface AutoKeyPayload extends Payload, Payload.Data<string> {
	/**
	 * The method for this payload.
	 * @since 2.0.0
	 */
	method: Method.AutoKey;
}
