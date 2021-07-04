import type { Method } from '../../types/Method';
import type { Payload } from './Payload';

export interface GetPayload<T> extends Payload<Method.Get> {
	data: T | null;
}
