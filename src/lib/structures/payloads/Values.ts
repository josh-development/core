import type { Payload } from './Payload';

export interface ValuesPayload<T = unknown> extends Payload {
	data: T[];
}
