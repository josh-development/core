import type { Awaitable } from '@sapphire/utilities';
import type { Method, Trigger } from '.';
import type { JoshProviderError } from '../errors';

/**
 * The base payload to use for most Josh operations.
 * @since 2.0.0
 */
export interface Payload {
  /**
   * The method this payload is for.
   * @since 2.0.0
   */
  method: Method;

  /**
   * The trigger this payload is currently for.
   * @since 2.0.0
   */
  trigger?: Trigger;

  /**
   * The error for this payload.
   * @since 2.0.0
   */
  error?: JoshProviderError;
}

export namespace Payload {
  /**
   * The key/path extension for {@link Payload}
   * @since 2.0.0
   */
  export interface KeyPath {
    /**
     * The key for this extension.
     * @since 2.0.0
     */
    key: string;

    /**
     * The path for this extension.
     * @since 2.0.0
     */
    path: string[];
  }

  /**
   * The data extension for {@link Payload}
   * @since 2.0.0
   */
  export interface Data<Value = unknown> {
    /**
     * The data for this extension.
     * @since 2.0.0
     */
    data?: Value;
  }

  export interface WithData<Value = unknown> extends Payload {
    /**
     * The data for this extension.
     * @since 2.0.0
     */
    data: Value;
  }

  /**
   * The hook extension for {@link Payload}
   * @since 2.0.0
   */
  export interface ByHook<T extends Hook<any, any>> {
    /**
     * The type for this extension.
     * @since 2.0.0
     * @see {@link Type}
     */
    type: Type.Hook;

    /**
     * The hook for this extension.
     * @since 2.0.0
     */
    hook: T;
  }

  /**
   * The value extension for {@link Payload}
   * @since 2.0.0
   */
  export interface ByValue<Value> {
    /**
     * The type for this extension.
     * @since 2.0.0
     * @see {@link Type}
     */
    type: Type.Value;

    /**
     * The value for this extension.
     * @since 2.0.0
     */
    value: Value;
  }

  /**
   * The value with path extension for {@link Payload}
   * @since 2.0.0
   * @see {@link ByValue}
   */
  export interface ByValueWithPath<Value> extends ByValue<Value> {
    /**
     * A path to the value for equality check.
     * @since 2.0.0
     */
    path: string[];
  }

  /**
   * The path extension for {@link Payload}
   * @since 2.0.0
   */
  export interface ByPath {
    /**
     * The type for this extension.
     * @since 2.0.0
     * @see {@link Type}
     */
    type: Type.Path;

    /**
     * The path for this extension.
     * @since 2.0.0
     */
    path: string[];
  }

  /**
   * The Type enum for {@link Payload}
   * @since 2.0.0
   * @see {@link ByHook}
   * @see {@link ByPath}
   * @see {@link ByValue}
   */
  export enum Type {
    Hook,

    Value,

    Path
  }

  export type Hook<Value, R = boolean> = (value: Value) => Awaitable<R>;
  export type HookWithKey<Value, R = boolean> = (value: Value, key: string) => Awaitable<R>;
}
