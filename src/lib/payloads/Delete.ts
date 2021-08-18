import type { Payload } from './Payload';

/**
 * The {@link Payload} for `delete` using {@link Payload.KeyPath}
 * @since 2.0.0
 */
export interface DeletePayload extends Payload, Payload.KeyPath {}
