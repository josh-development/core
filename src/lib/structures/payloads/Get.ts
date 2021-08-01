import type { KeyPath } from '../../types';
import type { Payload } from './Payload';

export interface GetPayload<T = unknown> extends Payload, KeyPath {
	data: T | null;
}
