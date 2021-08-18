import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The {@link Payload} for `getAll` using {@link Payload.Data}
 * @since 2.0.0
 */
export interface GetAllPayload<Value = unknown> extends Payload, Payload.Data<Record<string, Value>> {
	/**
	 * The method for this payload.
	 * @since 2.0.0
	 */
	method: Method.GetAll;
}
