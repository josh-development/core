import type { KeyPath } from '../../types';
import type { Payload } from './Payload';

export interface HasPayload extends Payload, KeyPath {
	data: boolean;
}
