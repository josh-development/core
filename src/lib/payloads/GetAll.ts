import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The payload for {@link Method.GetAll}
 * @see {@link Payload}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface GetAllPayload<DataValue> extends Payload, Payload.Data<Record<string, DataValue>> {
  /**
   * The method this payload is for.
   * @since 2.0.0
   */
  method: Method.GetAll;
}
