import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The payload for {@link Method.Ensure}
 * @see {@link Payload}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface EnsurePayload<Value = unknown> extends Payload, Payload.Data<Value> {
	/**
	 * The method for this payload.
	 * @since 2.0.0
	 */
	method: Method.Ensure;

	/**
	 * The key for this payload.
	 * @since 2.0.0
	 */
	key: string;

	/**
	 * The default value for this payload.
	 * @since 2.0.0
	 */
	defaultValue: Value;
}
