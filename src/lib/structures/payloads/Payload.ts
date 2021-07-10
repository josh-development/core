import type { Method } from '../../types/Method';

export interface Payload {
	method: Method;
	startTimestamp: number;
	endTimestamp: number;
}
