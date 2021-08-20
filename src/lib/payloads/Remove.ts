import type { Awaited } from '@sapphire/utilities';
import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The union payload for {@link Method.Remove}
 * @see {@link Payload}
 * @see {@link Payload.KeyPath}
 * @since 2.0.0
 */
export interface RemovePayload<Value = unknown> extends Payload, Payload.KeyPath {
	/**
	 * The method for this payload.
	 * @since 2.0.0
	 */
	method: Method.Remove;

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
	inputHook?: RemoveHook<Value>;
}

/**
 * The data payload for {@link Method.Remove}
 * @see {@link Payload}
 * @see {@link Payload.ByData}
 * @see {@link Payload.KeyPath}
 * @since 2.0.0
 */
export interface RemoveByDataPayload<Value = unknown> extends Payload, Payload.ByData, Payload.KeyPath {
	/**
	 * The method for this payload.
	 * @since 2.0.0
	 */
	method: Method.Remove;

	/**
	 * The type for this payload.
	 * @since 2.0.0
	 */
	type: Payload.Type.Data;

	/**
	 * The input data for this payload.
	 * @since 2.0.0
	 */
	inputData: Value;
}

/**
 * The hook payload for {@link Method.Remove}
 * @see {@link Payload}
 * @see {@link Payload.ByHook}
 * @see {@link Payload.KeyPath}
 */
export interface RemoveByHookPayload<Value = unknown> extends Payload, Payload.ByHook, Payload.KeyPath {
	/**
	 * The method for this payload.
	 * @since 2.0.0
	 */
	method: Method.Remove;

	/**
	 * The type for this payload.
	 * @since 2.0.0
	 */
	type: Payload.Type.Hook;

	/**
	 * The input hook for this payload.
	 * @since 2.0.0
	 */
	inputHook: RemoveHook<Value>;
}

/**
 * The hook for {@link RemoveByHookPayload}
 * @since 2.0.0
 */
export type RemoveHook<Value = unknown> = (data: Value) => Awaited<boolean>;
