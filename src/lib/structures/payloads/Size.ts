import type { Payload } from './Payload';

export interface SizePayload extends Payload, Payload.Data<number> {}
