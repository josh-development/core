import type { Method } from '../types';
import type { Payload } from './Payload';

export interface ValuesPayload<Value = unknown> extends Payload, Payload.Data<Value[]> {
	method: Method.Values;
}
