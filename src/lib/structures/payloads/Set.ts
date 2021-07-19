import type { Payload } from './Payload';

export interface SetPayload extends Payload {
	key: string;
	path: string;
}
