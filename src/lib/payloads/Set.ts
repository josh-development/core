import type { Method } from '../types';
import type { Payload } from './Payload';

export interface SetPayload extends Payload, Payload.KeyPath {
	method: Method.Set;
}
