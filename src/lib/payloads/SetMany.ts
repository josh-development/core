import type { Method, StringArray } from '../types';
import type { Payload } from './Payload';

/**
 * The payload for {@link Method.SetMany}
 * @see {@link Payload}
 * @since 2.0.0
 */
export interface SetManyPayload<Value> extends Payload, Payload.Data<[SetManyKeyPath, Value][]> {
  /**
   * The method this payload is for.
   * @since 2.0.0
   */
  method: Method.SetMany;

  /**
   * Whether to overwrite existing data.
   * @since 2.0.0
   */
  overwrite: boolean;
}

/**
 * The key/path data for {@link SetManyPayload}.
 * @since 2.0.0
 */
export interface SetManyKeyPath {
  /**
   * The key to set.
   * @since 2.0.0
   */
  key: string;

  /**
   * The path to set at.
   * @since 2.0.0
   */
  path: StringArray;
}
