import type { Method, StringArray } from '../types';
import type { Payload } from './Payload';

/**
 * The payload for {@link Method.Keys}
 * @see {@link Payload}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface KeysPayload extends Payload, Payload.Data<StringArray> {
  /**
   * The method this payload is for.
   * @since 2.0.0
   */
  method: Method.Keys;
}
