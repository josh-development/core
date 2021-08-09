import type { Payload } from './Payload';

export interface ValuesPayload<Value = unknown> extends Payload, Payload.Data<Value[]> {}
