import type { Method } from '../types';
import type { Payload } from './Payload';

export interface PushPayload extends Payload, Payload.KeyPath {
	method: Method.Push;
}
