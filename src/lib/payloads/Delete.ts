import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The payload for {@link Method.Delete}
 * @see {@link Payload}
 * @see {@link Payload.KeyPath}
 * @since 2.0.0
 */
export interface DeletePayload extends Payload, Payload.KeyPath {
  /**
   * The method this payload is for.
   * @since 2.0.0
   */
  method: Method.Delete;
}
