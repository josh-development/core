import type { Awaitable, Primitive } from '@sapphire/utilities';
import type { Method, StringArray } from '../types';
import type { Payload } from './Payload';

/**
 * The union payload for {@link Method.Filter}
 * @see {@link Payload}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface FilterPayload<DataValue> extends Payload, Payload.Data<Record<string, DataValue>> {
  /**
   * The method this payload is for.
   * @since 2.0.0
   */
  method: Method.Filter;

  /**
   * The type for this payload.
   * @since 2.0.0
   */
  type: Payload.Type.Hook | Payload.Type.Value;

  /**
   * The hook to check equality.
   * @since 2.0.0
   */
  hook?: FilterHook<DataValue>;

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
 * The hook payload for {@link Method.Filter}
 * @see {@link Payload}
 * @see {@link Payload.ByHook}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface FilterByHookPayload<DataValue> extends Payload, Payload.ByHook, Payload.Data<Record<string, DataValue>> {
  /**
   * The method this payload is for.
   * @since 2.0.0
   */
  method: Method.Filter;

  /**
   * The hook for this payload.
   * @since 2.0.0
   */
  hook: FilterHook<DataValue>;
}

/**
 * The value payload for {@link Method.Filter}
 * @see {@link Payload}
 * @see {@link Payload.ByValue}
 * @see {@link Payload.Data}
 * @since 2.0.0
 */
export interface FilterByValuePayload<DataValue> extends Payload, Payload.ByValue, Payload.Data<Record<string, DataValue>> {
  /**
   * The method this payload is for.
   * @since 2.0.0
   */
  method: Method.Filter;

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
 * The hook for {@link FilterByHookPayload}
 * @since 2.0.0
 */
export type FilterHook<HookValue> = (value: HookValue) => Awaitable<boolean>;
