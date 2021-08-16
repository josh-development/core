import type { Payload } from './Payload';

export interface EnsurePayload<Value = unknown> extends Payload, Payload.Data<Value> {
	key: string;

	defaultValue: Value;
}
