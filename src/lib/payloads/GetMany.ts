import type { KeyPathArray } from '../types';
import type { Payload } from './Payload';

export interface GetManyPayload<Value = unknown> extends Payload, Payload.Data<Record<string, Value | null>> {
	keyPaths: KeyPathArray[];
}
