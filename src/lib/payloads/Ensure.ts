import type { Method } from '../types';
import type { Payload } from './Payload';

export interface EnsurePayload<Value = unknown> extends Payload, Payload.Data<Value> {
	method: Method.Ensure;

	key: string;

	defaultValue: Value;
}
