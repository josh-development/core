import type { Payload } from './Payload';

export interface GetManyPayload<T> extends Payload {
	keyPaths: [string, string[]][];
	data: Record<string, T>;
}
