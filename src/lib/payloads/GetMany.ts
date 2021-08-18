import type { KeyPathArray } from '../types';
import type { Payload } from './Payload';

/**
 * The {@link Payload} for `getMany` using {@link Payload.Data}
 * @since 2.0.0
 */
export interface GetManyPayload<Value = unknown> extends Payload, Payload.Data<Record<string, Value | null>> {
	/**
	 * The key/paths for this payload.
	 * @since 2.0.0
	 */
	keyPaths: KeyPathArray[];
}
