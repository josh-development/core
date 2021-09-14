import type { Method, StringArray } from '../types';
import type { Payload } from './Payload';

/**
 * The payload for {@link Method.GetMany}
 * @see {@link Payload}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface GetManyPayload<DataValue> extends Payload, Payload.Data<Record<string, DataValue | null>> {
	/**
	 * The method this payload is for.
	 * @since 2.0.0
	 */
	method: Method.GetMany;

	/**
	 * The keys to get.
	 * @since 2.0.0
	 */
	keys: StringArray;
}
