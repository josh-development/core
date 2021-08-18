import type { KeyPathArray } from '../types';
import type { Payload } from './Payload';

/**
 * The {@link Payload} for `setMany`
 * @since 2.0.0
 */
export interface SetManyPayload extends Payload {
	/**
	 * The key/paths for this payload.
	 * @since 2.0.0
	 */
	keyPaths: KeyPathArray[];
}
