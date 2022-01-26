import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The payload for {@link Method.Ensure}
 * @see {@link Payload}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface EnsurePayload<StoredValue> extends Payload, Payload.Data<StoredValue> {
  /**
   * The method this payload is for.
   * @since 2.0.0
   */
  method: Method.Ensure;

  /**
   * The key to get or set.
   * @since 2.0.0
   */
  key: string;

  /**
   * The default value to store if {@link EnsurePayload.key} doesn't exist.
   * @since 2.0.0
   */
  defaultValue: StoredValue;
}
