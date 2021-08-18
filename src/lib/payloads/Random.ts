import type { Payload } from './Payload';

/**
 * The {@link Payload} for `random` using {@link Payload.OptionalData}
 * @since 2.0.0
 */
export interface RandomPayload<Value = unknown> extends Payload, Payload.OptionalData<Value> {}
