import type { Payload } from './Payload';

export interface GetAllPayload<T = unknown> extends Payload {
	data: Record<string, T>;
}
