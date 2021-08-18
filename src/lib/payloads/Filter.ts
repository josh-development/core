import type { Awaited } from '@sapphire/utilities';
import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The {@link Payload} for `filter using {@link Payload.OptionalData}
 * @since 2.0.0
 */
export interface FilterPayload<Value = unknown> extends Payload, Payload.OptionalData<Record<string, Value | null>> {
	/**
	 * The method for this payload.
	 * @since 2.0.0
	 */
	method: Method.Filter;

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
	inputHook?: FilterHook<Value>;

	/**
	 * The path for this payload.
	 * @since 2.0.0
	 */
	path?: string[];
}

/**
 * The {@link Payload} for `filter` using {@link Payload.ByData} and {@link Payload.Data}
 * @since 2.0.0
 */
export interface FilterByDataPayload<Value = unknown> extends Payload, Payload.ByData, Payload.Data<Record<string, Value>> {
	/**
	 * The method for this payload.
	 * @since 2.0.0
	 */
	method: Method.Filter;

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
 * The {@link Payload} for `filter` using {@link Payload.ByHook} and {@link Payload.Data}
 * @since 2.0.0
 */
export interface FilterByHookPayload<Value = unknown> extends Payload, Payload.ByHook, Payload.Data<Record<string, Value>> {
	/**
	 * The method for this payload.
	 * @since 2.0.0
	 */
	method: Method.Filter;

	/**
	 * The input hook for this payload.
	 * @since 2.0.0
	 */
	inputHook: FilterHook<Value>;

	/**
	 * The path for this payload.
	 * @since 2.0.0
	 */
	path?: string[];
}

/**
 * The hook for {@link FilterByHookPayload}
 * @since 2.0.0
 */
export type FilterHook<Value = unknown> = (data: Value) => Awaited<Value>;
