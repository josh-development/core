import type { Payload } from './Payload';

/**
 * The {@link Payload} for `randomKey` using {@link Payload.OptionalData}
 * @since 2.0.0
 */
export interface RandomKeyPayload extends Payload, Partial<Payload.Data<string>> {}
