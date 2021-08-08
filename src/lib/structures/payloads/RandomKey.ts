import type { Payload } from './Payload';

export interface RandomKeyPayload extends Payload {
	data: string | null;
}
