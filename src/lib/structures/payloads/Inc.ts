import type { Payload } from './Payload';

export interface IncPayload extends Payload, Payload.KeyPath, Payload.Data<number> {}
