import type { Payload } from './Payload';

export interface EnsurePayload<T = unknown> extends Payload {
	key: string;
	data: T;
	defaultValue: T;
}
