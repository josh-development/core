import type { KeyPathArray } from '../../types';
import type { Payload } from './Payload';

export interface SetManyPayload extends Payload {
	keyPaths: KeyPathArray[];
}
