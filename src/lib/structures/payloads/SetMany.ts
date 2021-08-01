import type { Payload } from './Payload';

export interface SetManyPayload extends Payload {
	keyPaths: [string, string[]][];
}
