import type { Methods } from '../../types/Methods';
import type { Payload } from './Payload';

export interface GetPayload<T> extends Payload<Methods.Get> {
	data: T | null;
}
