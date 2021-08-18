import type { Awaited } from '@sapphire/utilities';
import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The {@link Payload} for `find` using {@link Payload.OptionalData}
 * @since 2.0.0
 */
export interface FindPayload<Value = unknown> extends Payload, Payload.OptionalData<Value> {
	/**
	 * The method for this payload.
	 */
	method: Method.Find;

	/**
	 * The type for this payload.
	 * @since 2.0.0
	 */
	type: Payload.Type;

	/**
	 * The input data for this payload.
	 * @since 2.0.0
	 */
	inputData?: Value;

	/**
	 * The input hook for this payload.
	 * @since 2.0.0
	 */
	inputHook?: FindHook<Value>;

	/**
	 * The path for this payload.
	 * @since 2.0.0
	 */
	path?: string[];
}

/**
 * The {@link Payload} for `find` using {@link Payload.ByData} and {@link Payload.OptionalData}
 * @since 2.0.0
 */
export interface FindByDataPayload<Value = unknown> extends Payload, Payload.ByData, Payload.OptionalData<Value> {
	/**
	 * The method for this payload
	 * @since 2.0.0
	 */
	method: Method.Find;

	/**
	 * The input data for this payload.
	 * @since 2.0.0
	 */
	inputData: Value;

	/**
	 * The path for this payload.
	 * @since 2.0.0
	 */
	path?: string[];
}

/**
 * The {@link Payload} for `find` using {@link Payload.ByHook} and {@link Payload.OptionalData}
 * @since 2.0.0
 */
export interface FindByHookPayload<Value = unknown> extends Payload, Payload.ByHook, Payload.OptionalData<Value> {
	/**
	 * The method for this payload
	 * @since 2.0.0
	 */
	method: Method.Find;

	/**
	 * The input hook for this payload.
	 * @since 2.0.0
	 */
	inputHook: FindHook<Value>;

	/**
	 * The path for this payload.
	 */
	path?: string[];
}

/**
 * The hook for {@link FindByHookPayload}
 * @since 2.0.0
 */
export type FindHook<Value = unknown> = (data: Value) => Awaited<boolean>;
