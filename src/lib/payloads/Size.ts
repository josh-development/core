import type { Method } from '../types';
import type { Payload } from './Payload';

export interface SizePayload extends Payload, Payload.Data<number> {
	method: Method.Size;
}
