import type { Method } from '../types';
import type { Payload } from './Payload';

export interface RandomKeyPayload extends Payload, Partial<Payload.Data<string>> {
	method: Method.RandomKey;
}
