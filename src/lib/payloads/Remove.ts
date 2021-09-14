import type { Awaited, Primitive } from '@sapphire/utilities';
import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The union payload for {@link Method.Remove}
 * @see {@link Payload}
 * @see {@link Payload.KeyPath}
 * @since 2.0.0
 */
export interface RemovePayload<HookValue> extends Payload, Payload.KeyPath {
	/**
	 * The method this payload is for.
	 * @since 2.0.0
	 */
	method: Method.Remove;

	/**
	 * The type for this payload.
	 * @since 2.0.0
	 */
	type: Payload.Type.Hook | Payload.Type.Value;

	/**
	 * The hook to check equality.
	 * @since 2.0.0
	 */
	hook?: RemoveHook<HookValue>;

	/**
	 * The value to check equality.
	 * @since 2.0.0
	 */
	value?: Primitive;
}

/**
 * The hook payload for {@link Method.Remove}
 * @see {@link Payload}
 * @see {@link Payload.ByHook}
 * @see {@link Payload.KeyPath}
 */
export interface RemoveByHookPayload<HookValue> extends Payload, Payload.ByHook, Payload.KeyPath {
	/**
	 * The method this payload is for.
	 * @since 2.0.0
	 */
	method: Method.Remove;

	/**
	 * The type for this payload.
	 * @since 2.0.0
	 */
	type: Payload.Type.Hook;

	/**
	 * The hook to check equality.
	 * @since 2.0.0
	 */
	hook: RemoveHook<HookValue>;
}

/**
 * The data payload for {@link Method.Remove}
 * @see {@link Payload}
 * @see {@link Payload.ByValue}
 * @see {@link Payload.KeyPath}
 * @since 2.0.0
 */
export interface RemoveByValuePayload extends Payload, Payload.ByValue, Payload.KeyPath {
	/**
	 * The method this payload is for.
	 * @since 2.0.0
	 */
	method: Method.Remove;

	/**
	 * The type for this payload.
	 * @since 2.0.0
	 */
	type: Payload.Type.Value;

	/**
	 * The value to check equality.
	 * @since 2.0.0
	 */
	value: Primitive;
}

/**
 * The hook for {@link RemoveByHookPayload}
 * @since 2.0.0
 */
export type RemoveHook<Value> = (value: Value) => Awaited<boolean>;
