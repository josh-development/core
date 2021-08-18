import type { Payload } from './Payload';

/**
 * The {@link Payload} for `inc` using {@link Payload.KeyPath} and {@link Payload.OptionalData}
 * @since 2.0.0
 */
export interface IncPayload extends Payload, Payload.KeyPath, Payload.OptionalData<number> {}
