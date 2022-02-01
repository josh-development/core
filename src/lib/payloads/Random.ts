import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The payload for {@link Method.Random}
 * @see {@link Payload}
 * @see {@link Payload.OptionalData}
 * @since 2.0.0
 */
export interface RandomPayload<DataValue> extends Payload, Payload.OptionalData<DataValue[]> {
  /**
   * The method this payload is for.
   * @since 2.0.0
   */
  method: Method.Random;

  /**
   * The count of random values to get.
   * @since 2.0.0
   */
  count: number;

  /**
   * Whether to allow duplicate values.
   * @since 2.0.0
   */
  duplicates: boolean;
}
