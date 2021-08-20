import type { Awaited } from '@sapphire/utilities';
import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The union payload for {@link Method.Map}
 * @see {@link Payload}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface MapPayload<Value = unknown> extends Payload, Payload.Data<Value[]> {
	/**
	 * The method for this payload.
	 *  @since 2.0.0
	 */
	method: Method.Map;

	/**
	 *  The type for this payload.
	 *  @since 2.0.0
	 */
	type: Payload.Type.Path | Payload.Type.Hook;

	/**
	 * The path for this payload.
	 *  @since 2.0.0
	 */
	path?: string[];

	/**
	 * The hook for this payload.
	 *  @since 2.0.0
	 */ hook?: MapHook<Value>;
}

/**
 *  The path payload for {@link Method.Map}
 *  @see {@link Payload}
 *  @see {@link Payload.ByPath}
 *  @see {@link Payload.Data}
 *  @since 2.0.0
 */
export interface MapByPathPayload<Value = unknown> extends Payload, Payload.ByPath, Payload.Data<Value[]> {
	/**
	 * The method for this payload.
	 * @since 2.0.0
	 */
	method: Method.Map;

	/**
	 *  The path for this payload.
	 * @since 2.0.0
	 */
	path: string[];
}

/**
 * The hook payload for {@link Method.Map}
 * @see {@link Payload}
 * @see {@link Payload.ByHook}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface MapByHookPayload<Value = unknown> extends Payload, Payload.ByHook, Payload.Data<Value[]> {
	/**
	 * The method for this payload.
	 * @since 2.0.0
	 */
	method: Method.Map;

	/**
	 * The hook for this payload.
	 * @since 2.0.0
	 */
	hook: MapHook<Value>;
}

/**
 * The hook for {@link MapByHookPayload}
 * @since 2.0.0
 */
export type MapHook<Value = unknown> = (data: Value) => Awaited<Value>;
