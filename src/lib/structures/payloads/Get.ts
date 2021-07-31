import type { Payload } from './Payload';

export interface GetPayload<T = unknown> extends Payload {
	key: string;
	path: string[];
	data: T | null;
}
