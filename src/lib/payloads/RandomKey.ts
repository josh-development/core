import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The payload for {@link Method.RandomKey}
 * @see {@link Payload}
 * @see {@link Payload.OptionalData}
 * @since 2.0.0
 */
export interface RandomKeyPayload extends Payload, Payload.OptionalData<string> {
  /**
   * The method this payload is for.
   * @since 2.0.0
   */
  method: Method.RandomKey;
}
