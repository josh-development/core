import type { Payload } from './Payload';

/**
 * The {@link Payload} for `values` using {@link Payload.Data}
 * @since 2.0.0
 */
export interface ValuesPayload<Value = unknown> extends Payload, Payload.Data<Value[]> {}
