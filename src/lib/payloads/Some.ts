import type { Awaitable, Primitive } from '@sapphire/utilities';
import type { Method, StringArray } from '../types';
import type { Payload } from './Payload';

/**
 * The union payload for {@link Method.Some}
 * @see {@link Payload}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface SomePayload<HookValue> extends Payload, Payload.Data<boolean> {
	/**
	 * The method this payload is for.
	 * @since 2.0.0
	 */
	method: Method.Some;

	/**
	 * The type for this payload.
	 * @since 2.0.0
	 */
	type: Payload.Type.Hook | Payload.Type.Value;

	/**
	 * The hook to check equality.
	 * @since 2.0.0
	 */
	hook?: SomeHook<HookValue>;

	/**
	 * The value to check equality.
	 * @since 2.0.0
	 */
	value?: Primitive;

	/**
	 * A path to the value to check equality.
	 * @since 2.0.0
	 */
	path?: StringArray;
}

/**
 * The hook payload for {@link Method.Some}
 * @see {@link Payload}
 * @see {@link Payload.ByHook}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface SomeByHookPayload<HookValue> extends Payload, Payload.ByHook, Payload.Data<boolean> {
	/**
	 * The method this payload is for.
	 * @since 2.0.0
	 */
	method: Method.Some;

	/**
	 * The input hook for this payload.
	 * @since 2.0.0
	 */
	hook: SomeHook<HookValue>;
}

/**
 * The data payload for {@link Method.Some}
 * @see {@link Payload}
 * @see {@link Payload.ByValue}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface SomeByValuePayload extends Payload, Payload.ByValue, Payload.Data<boolean> {
	/**
	 * The method this payload is for.
	 * @since 2.0.0
	 */
	method: Method.Some;

	/**
	 * The input data for this payload.
	 * @since 2.0.0
	 */
	value: Primitive;

	/**
	 * A path to the value to check equality.
	 * @since 2.0.0
	 */
	path: StringArray;
}

/**
 * The hook for {@link SomeByHookPayload}
 * @since 2.0.0
 */
export type SomeHook<Value> = (value: Value) => Awaitable<boolean>;
