import type { Method } from '../types';
import type { Payload } from './Payload';

export interface AutoKeyPayload extends Payload, Payload.Data<string> {
	method: Method.AutoKey;
}
