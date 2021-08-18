import type { Payload } from './Payload';

/**
 * The {@link Payload} for `ensure` using {@link Payload.Data}
 * @since 2.0.0
 */
export interface EnsurePayload<Value = unknown> extends Payload, Payload.Data<Value> {
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
