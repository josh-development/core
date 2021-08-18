import type { Payload } from './Payload';

/**
 * The {@link Payload} for `has` using {@link Payload.KeyPath} and {@link Payload.Data}
 * @since 2.0.0
 */
export interface HasPayload extends Payload, Payload.KeyPath, Payload.Data<boolean> {}
