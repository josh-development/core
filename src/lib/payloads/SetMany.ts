import type { KeyPathArray, Method } from '../types';
import type { Payload } from './Payload';

export interface SetManyPayload extends Payload {
	method: Method.SetMany;

	keyPaths: KeyPathArray[];
}
