import type { KeyPathArray, Method } from '../types';
import type { Payload } from './Payload';

export interface GetManyPayload<Value = unknown> extends Payload, Payload.Data<Record<string, Value | null>> {
	method: Method.GetMany;

	keyPaths: KeyPathArray[];
}
