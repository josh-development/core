import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The {@link Payload} for `get` using {@link Payload.KeyPath} and {@link Payload.OptionalData}
 * @since 2.0.0
 */
export interface GetPayload<Value = unknown> extends Payload, Payload.KeyPath, Payload.OptionalData<Value> {
	/**
	 * The method for this payload.
	 * @since 2.0.0
	 */
	method: Method.Get;
}
