import type { Method } from '../../types/Method';

export interface Payload<M extends Method> {
	method: M;
	startTimestamp: number;
	endTimestamp: number;
}
