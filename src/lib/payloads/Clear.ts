import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The payload for {@link Method.Clear}
 * @since 2.0.0
 * @see {@link Payload}
 * @since 2.0.0
 */
export interface ClearPayload extends Payload {
  /**
   * The method.this payload is for.
   * @since 2.0.0
   */
  method: Method.Clear;
}
