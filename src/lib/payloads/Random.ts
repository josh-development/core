import type { Method } from '../types';
import type { Payload } from './Payload';

export interface RandomPayload<Value = unknown> extends Payload, Payload.OptionalData<Value> {
	method: Method.Random;
}
