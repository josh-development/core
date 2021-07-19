import type { Method } from '../../types';

export interface Payload {
	method: Method;
	startTimestamp?: number;
	endTimestamp?: number;
}
