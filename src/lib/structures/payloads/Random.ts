import type { Payload } from './Payload';

export interface RandomPayload<Value = unknown> extends Payload, Partial<Payload.Data<Value>> {}
