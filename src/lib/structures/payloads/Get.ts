import type { Payload } from './Payload';

export interface GetPayload<T = unknown> extends Payload {
	data: T | null;
}
