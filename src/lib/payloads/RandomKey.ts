import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The payload for {@link Method.RandomKey}
 * @see {@link Payload}
 * @see {@link Payload.OptionalData}
 * @since 2.0.0
 */
export interface RandomKeyPayload extends Payload, Partial<Payload.Data<string>> {
	/**
	 * The method for this payload.
	 * @since 2.0.0
	 */
	method: Method.RandomKey;
}
