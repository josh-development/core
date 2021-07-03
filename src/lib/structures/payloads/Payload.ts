import type { Methods } from '../../types/Methods';

export interface Payload<M extends Methods> {
	method: M;
	startTimestamp: number;
	endTimestamp: number;
}
