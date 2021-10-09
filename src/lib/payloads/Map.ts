import type { Awaitable } from '@sapphire/utilities';
import type { Method, StringArray } from '../types';
import type { Payload } from './Payload';

/**
 * The union payload for {@link Method.Map}
 * @see {@link Payload}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface MapPayload<DataValue, HookValue = DataValue> extends Payload, Payload.Data<DataValue[]> {
	/**
	 * The method this payload is for.
	 *  @since 2.0.0
	 */
	method: Method.Map;

	/**
	 *  The type for this payload.
	 *  @since 2.0.0
	 */
	type: Payload.Type.Hook | Payload.Type.Path;

	/**
	 * The hook to map by.
	 *  @since 2.0.0
	 */
	hook?: MapHook<DataValue, HookValue>;

	/**
	 * The path to map by.
	 *  @since 2.0.0
	 */
	path?: StringArray;
}

/**
 * The hook payload for {@link Method.Map}
 * @see {@link Payload}
 * @see {@link Payload.ByHook}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface MapByHookPayload<DataValue, HookValue = DataValue> extends Payload, Payload.ByHook, Payload.Data<DataValue[]> {
	/**
	 * The method this payload is for.
	 * @since 2.0.0
	 */
	method: Method.Map;

	/**
	 * The hook to map by.
	 * @since 2.0.0
	 */
	hook: MapHook<DataValue, HookValue>;
}

/**
 *  The path payload for {@link Method.Map}
 *  @see {@link Payload}
 *  @see {@link Payload.ByPath}
 *  @see {@link Payload.Data}
 *  @since 2.0.0
 */
export interface MapByPathPayload<DataValue> extends Payload, Payload.ByPath, Payload.Data<DataValue[]> {
	/**
	 * The method this payload is for.
	 * @since 2.0.0
	 */
	method: Method.Map;

	/**
	 *  The path to map by.
	 * @since 2.0.0
	 */
	path: StringArray;
}

/**
 * The hook for {@link MapByHookPayload}
 * @since 2.0.0
 */
export type MapHook<Value, HookValue = Value> = (data: HookValue) => Awaitable<Value>;
