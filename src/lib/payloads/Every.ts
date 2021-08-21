import type { Awaited } from '@sapphire/utilities';
import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The union payload for {@link Method.Every}
 * @see {@link Payload}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface EveryPayload<Value = unknown> extends Payload, Payload.Data<boolean> {
	/**
	 * The method for this payload.
	 * @since 2.0.0
	 */
	method: Method.Every;

	/**
	 * The type for this payload.
	 * @since 2.0.0
	 */
	type: Payload.Type.Data | Payload.Type.Hook;

	/**
	 * The input data for this payload.
	 * @since 2.0.0
	 */
	inputData?: Value;

	/**
	 * The input hook for this payload.
	 * @since 2.0.0
	 */
	inputHook?: EveryHook<Value>;

	/**
	 * The path for this payload.
	 * @since 2.0.0
	 */
	path?: string[];
}

/**
 * The data payload for {@link Method.Every}
 * @see {@link Payload}
 * @see {@link Payload.ByData}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface EveryByDataPayload<Value = unknown> extends Payload, Payload.ByData, Payload.Data<boolean> {
	/**
	 * The method for this payload.
	 * @since 2.0.0
	 */
	method: Method.Every;

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
 * The hook payload for {@link Method.Every}
 * @see {@link Payload}
 * @see {@link Payload.ByHook}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface EveryByHookPayload<Value = unknown> extends Payload, Payload.ByHook, Payload.Data<boolean> {
	/**
	 * The method for this payload.
	 * @since 2.0.0
	 */
	method: Method.Every;

	/**
	 * The input hook for this payload.
	 * @since 2.0.0
	 */
	inputHook: EveryHook<Value>;

	/**
	 * The path for this payload.
	 * @since 2.0.0
	 */
	path?: string[];
}

/**
 * The hook for {@link EveryByHookPayload}
 * @since 2.0.0
 */
export type EveryHook<Value = unknown> = (data: Value) => Awaited<boolean>;
