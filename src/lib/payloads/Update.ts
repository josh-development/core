import type { Awaited } from '@sapphire/utilities';
import type { Method } from '../types';
import type { Payload } from './Payload';

/**
 * The union payload for {@link Method.Update}
 * @see {@link Payload}
 * @see {@link Payload.KeyPath}
 * @see {@link Payload.OptionalData}
 * @since 2.0.0
 */
export interface UpdatePayload<DataValue, HookValue = DataValue, Value = DataValue>
	extends Payload,
		Payload.KeyPath,
		Payload.OptionalData<DataValue> {
	/**
	 * The method this payload is for.
	 * @since 2.0.0
	 */
	method: Method.Update;

	/**
	 * The hook to update stored value.
	 * @since 2.0.0
	 */
	hook: UpdateHook<HookValue, Value>;
}

/**
 * The hook for {@link UpdateByHookPayload}
 * @since 2.0.0
 */
export type UpdateHook<HookValue, Value> = (value: HookValue) => Awaited<Value>;
