import type { Awaited } from '@sapphire/utilities';
import type { KeyPath } from '../../types';
import type { Payload } from './Payload';

export interface UpdateByDataPayload<T = unknown> extends Payload, KeyPath {
	inputData?: T;
	data?: T;
}

export interface UpdateByHookPayload<T = unknown> extends Payload, KeyPath {
	inputHook?: UpdateHook<T>;
	data?: T;
}

export type UpdateHook<T = unknown> = (currentData: T | null) => Awaited<T>;

export type UpdatePayload<T = unknown> = UpdateByDataPayload<T> | UpdateByHookPayload<T>;
