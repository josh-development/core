import type { Payload } from './Payload';

/**
 * The {@link Payload} for `dec` using {@link Payload.KeyPath} and {@link Payload.OptionalData}
 * @since 2.0.0
 */
export interface DecPayload extends Payload, Payload.KeyPath, Payload.OptionalData<number> {}
