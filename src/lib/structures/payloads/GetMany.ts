import type { Payload } from './Payload';

export interface GetManyPayload<T> extends Payload {
	keys: [string, string[]][];
	data: Record<string, T>;
}
