import type { Payload } from './Payload';

/**
 * The {@link Payload} for `push` using {@link Payload.KeyPath}
 * @since 2.0.0
 */
export interface PushPayload extends Payload, Payload.KeyPath {}
