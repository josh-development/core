import type { Awaitable, Primitive } from '@sapphire/utilities';
import type { Method, StringArray } from '../types';
import type { Payload } from './Payload';

/**
 * The union payload for {@link Method.Every}
 * @see {@link Payload}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface EveryPayload<HookValue> extends Payload, Payload.Data<boolean> {
	/**
	 * The method this payload is for.
	 * @since 2.0.0
	 */
	method: Method.Every;

	/**
	 * The type for this payload.
	 * @since 2.0.0
	 */
	type: Payload.Type.Hook | Payload.Type.Value;

	/**
	 * The hook to check equality.
	 * @since 2.0.0
	 */
	hook?: EveryHook<HookValue>;

	/**
	 * The value to check equality.
	 * @since 2.0.0
	 */
	value?: Primitive;

	/**
	 * A path to the value for equality check.
	 * @since 2.0.0
	 */
	path?: StringArray;
}

/**
 * The hook payload for {@link Method.Every}
 * @see {@link Payload}
 * @see {@link Payload.ByHook}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface EveryByHookPayload<HookValue> extends Payload, Payload.ByHook, Payload.Data<boolean> {
	/**
	 * The method this payload is for.
	 * @since 2.0.0
	 */
	method: Method.Every;

	/**
	 * The hook to check equality.
	 * @since 2.0.0
	 */
	hook: EveryHook<HookValue>;
}

/**
 * The value payload for {@link Method.Every}
 * @see {@link Payload}
 * @see {@link Payload.ByValue}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface EveryByValuePayload extends Payload, Payload.ByValue, Payload.Data<boolean> {
	/**
	 * The method this payload is for.
	 * @since 2.0.0
	 */
	method: Method.Every;

	/**
	 * The value to check equality.
	 * @since 2.0.0
	 */
	value: Primitive;

	/**
	 * A path to the value for equality check.
	 * @since 2.0.0
	 */
	path: StringArray;
}

/**
 * The hook for {@link EveryByHookPayload}
 * @since 2.0.0
 */
export type EveryHook<Value> = (value: Value) => Awaitable<boolean>;
