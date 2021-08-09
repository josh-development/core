import type { Payload } from './Payload';

export interface GetPayload<Value = unknown> extends Payload, Payload.KeyPath, Payload.OptionalData<Value> {}
