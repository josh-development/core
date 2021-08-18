import type { Method } from '../types';
import type { Payload } from './Payload';

export interface HasPayload extends Payload, Payload.KeyPath, Payload.Data<boolean> {
	method: Method.Has;
}
