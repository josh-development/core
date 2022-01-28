import type { Awaitable, Primitive } from '@sapphire/utilities';
import type { Method, StringArray } from '../types';
import type { Payload } from './Payload';

/**
 * The union payload for {@link Method.Find}
 * @see {@link Payload}
 * @see {@link Payload.OptionalData}
 * @since 2.0.0
 */
export interface FindPayload<DataValue> extends Payload, Payload.OptionalData<DataValue> {
  /**
   * The method this payload is for.
   * @since 2.0.0
   */
  method: Method.Find;

  /**
   * The type for this payload.
   * @since 2.0.0
   */
  type: Payload.Type.Hook | Payload.Type.Value;

  /**
   * The hook to check equality.
   * @since 2.0.0
   */
  hook?: FindHook<DataValue>;

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
 * The hook payload for {@link Method.Find}
 * @see {@link Payload}
 * @see {@link Payload.ByHook}
 * @see {@link Payload.OptionalData}
 * @since 2.0.0
 */
export interface FindByHookPayload<DataValue> extends Payload, Payload.ByHook, Payload.OptionalData<DataValue> {
  /**
   * The method for this payload
   * @since 2.0.0
   */
  method: Method.Find;

  /**
   * The hook to check equality.
   * @since 2.0.0
   */
  hook: FindHook<DataValue>;
}

/**
 * The value payload for {@link Method.Find}
 * @see {@link Payload}
 * @see {@link Payload.ByValue}
 * @see {@link Payload.OptionalData}
 * @since 2.0.0
 */
export interface FindByValuePayload<DataValue> extends Payload, Payload.ByValue, Payload.OptionalData<DataValue> {
  /**
   * The method for this payload
   * @since 2.0.0
   */
  method: Method.Find;

  /**
   * The value to check equality.
   * @since 2.0.0
   */
  value: Primitive;

  /**
   * A path to the value for equality.
   * @since 2.0.0
   */
  path: StringArray;
}

/**
 * The hook for {@link FindByHookPayload}
 * @since 2.0.0
 */
export type FindHook<Value = unknown> = (data: Value) => Awaitable<boolean>;
