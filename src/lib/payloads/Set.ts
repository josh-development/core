import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The payload for {@link Method.Set}
 * @see {@link Payload}
 * @see {@link Payload.KeyPath}
 * @since 2.0.0
 */
export interface SetPayload<Value> extends Payload, Payload.KeyPath {
  /**
   * The method this payload is for.
   * @since 2.0.0
   */
  method: Method.Set;

  /**
   * The value to set.
   * @since 2.0.0
   */
  value: Value;
}
