import type { Method, StringArray } from '../types';
import type { Payload } from './Payload';

/**
 * The payload for {@link Method.DeleteMany}
 * @see {@link Payload}
 * @since 2.0.0
 */
export interface DeleteManyPayload extends Payload {
  /**
   * The method this payload is for.
   * @since 2.0.0
   */
  method: Method.DeleteMany;

  /**
   * The keys to delete.
   * @since 2.0.0
   */
  keys: StringArray;
}
