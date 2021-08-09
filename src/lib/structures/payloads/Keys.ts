import type { Payload } from './Payload';

export interface KeysPayload extends Payload, Payload.Data<string[]> {}
