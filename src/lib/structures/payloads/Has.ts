import type { Payload } from './Payload';

export interface HasPayload extends Payload {
	key: string;
	path: string;
	data: boolean;
}
