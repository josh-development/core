import type { Awaited } from '@sapphire/utilities';
import type { Payload } from './Payload';

/**
 * The {@link Payload} for `update` using {@link Payload.KeyPath} and {@link Payload.OptionalData}
 * @since 2.0.0
 */
export interface UpdatePayload<Value = unknown> extends Payload, Payload.KeyPath, Payload.OptionalData<Value> {
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
	inputHook?: UpdateHook<Value>;
}

/**
 * The {@link Payload} for `update` using {@link Payload.ByData}, {@link Payload.KeyPath}, and {@link Payload.OptionalData}
 * @since 2.0.0
 */
export interface UpdateByDataPayload<Value = unknown> extends Payload, Payload.ByData, Payload.KeyPath, Payload.OptionalData<Value> {
	/**
	 * The input data for this payload.
	 * @since 2.0.0
	 */
	inputData: Value;
}

/**
 * The {@link Payload} for `update` using {@link Payload.ByHook}, {@link Payload.KeyPath}, and {@link Payload.OptionalData}
 * @since 2.0.0
 */
export interface UpdateByHookPayload<Value = unknown> extends Payload, Payload.ByHook, Payload.KeyPath, Payload.OptionalData<Value> {
	/**
	 * The input hook for this payload.
	 * @since 2.0.0
	 */
	inputHook: UpdateHook<Value>;
}

/**
 * The hook for {@link UpdateByHookPayload}
 */
export type UpdateHook<Value = unknown> = (currentData: Value) => Awaited<Value>;
