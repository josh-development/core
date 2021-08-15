import type { Payload } from './Payload';

export interface SetPayload extends Payload, Payload.KeyPath {
	missingData?: boolean;
}
