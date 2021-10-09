import type { Awaitable, Primitive } from '@sapphire/utilities';
import type { Method, StringArray } from '../types';
import type { Payload } from './Payload';

/**
 * The union payload for {@link Method.Partition}
 * @see {@link Payload}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface PartitionPayload<DataValue> extends Payload, Payload.Data<PartitionData<DataValue>> {
	/**
	 * The method this payload is for.
	 * @since 2.0.0
	 */
	method: Method.Partition;

	/**
	 * The type for this payload.
	 * @since 2.0.0
	 */
	type: Payload.Type.Hook | Payload.Type.Value;

	/**
	 * The hook to check equality.
	 * @since 2.0.0
	 */
	hook?: PartitionHook<DataValue>;

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
 * The hook payload for {@link Method.Partition}
 * @see {@link Payload}
 * @see {@link Payload.ByHook}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface PartitionByHookPayload<DataValue> extends Payload, Payload.ByHook, Payload.Data<PartitionData<DataValue>> {
	/**
	 * The method this payload is for.
	 * @since 2.0.0
	 */
	method: Method.Partition;

	/**
	 * The hook for this payload
	 * @since 2.0.0
	 */
	hook: PartitionHook<DataValue>;
}

/**
 * The value payload for {@link Method.Partition}
 * @see {@link Payload}
 * @see {@link Payload.ByValue}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface PartitionByValuePayload<DataValue> extends Payload, Payload.ByValue, Payload.Data<PartitionData<DataValue>> {
	/**
	 * The method this payload is for.
	 * @since 2.0.0
	 */
	method: Method.Partition;

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
 * The data for {@link PartitionPayload}
 * @since 2.0.0
 */
export interface PartitionData<DataValue> {
	truthy: Record<string, DataValue>;

	falsy: Record<string, DataValue>;
}

/**
 * The hook for {@link PartitionByHookPayload}
 * @since 2.0.0
 */
export type PartitionHook<HookValue> = (value: HookValue) => Awaitable<boolean>;
