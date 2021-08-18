import type { Method } from '../types';
import type { Payload } from './Payload';

export interface DeletePayload extends Payload, Payload.KeyPath {
	method: Method.Delete;
}
