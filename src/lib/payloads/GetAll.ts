import type { Payload } from './Payload';

export interface GetAllPayload<Value = unknown> extends Payload, Payload.Data<Record<string, Value>> {}
