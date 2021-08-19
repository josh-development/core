import type { Method } from '../types';
import type { Payload } from './Payload';

export interface RandomKeyPayload extends Payload, Payload.OptionalData<string> {
	method: Method.RandomKey;
}
