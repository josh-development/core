import type { Payload } from './Payload';

export interface RandomPayload<V = unknown> extends Payload {
	data: V | null;
}
