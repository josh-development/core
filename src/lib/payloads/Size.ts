import type { Payload } from './Payload';

/**
 * The {@link Payload} for `size` using {@link Payload.Data}
 * @since 2.0.0
 */
export interface SizePayload extends Payload, Payload.Data<number> {}
