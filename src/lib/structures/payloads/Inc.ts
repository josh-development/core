import type { Payload } from './Payload';

export interface IncPayload extends Payload, Payload.KeyPath, Payload.OptionalData<number> {
	invalidType?: boolean;
	missingData?: boolean;
}
