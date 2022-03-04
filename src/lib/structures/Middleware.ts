import type { Awaitable } from '@sapphire/utilities';
import { JoshError } from '../errors';
import { Method, Payload, Payloads } from '../types';
import type { Josh } from './Josh';
import type { JoshProvider } from './JoshProvider';
import type { MiddlewareStore } from './MiddlewareStore';

/**
 * The base class for creating middlewares. Extend this class to create a middleware.
 * @see {@link Middleware.Options} for all available options for middlewares.
 * @since 2.0.0
 *
 * @example
 * ```typescript
 * (at)ApplyOptions<Middleware.Options>({
 *   name: 'middleware',
 *   // More options...
 * })
 * export class CoreMiddleware extends Middleware {
 *   // Make method implementations...
 * }
 * ```
 *
 * @example
 * ```typescript
 * export class CoreMiddleware extends Middleware {
 *   public constructor() {
 *     super({
 *       name: 'middleware'
 *     })
 *   }
 * }
 * ```
 */

export class Middleware<StoredValue = unknown> {
  /**
   * The store for this middleware.
   * @since 2.0.0
   */
  public store?: MiddlewareStore<StoredValue>;

  /**
   * The name of this middleware.
   * @since 2.0.0
   */
  public name: string;

  /**
   * The position this middleware runs at.
   * @since 2.0.0
   */
  public readonly position?: number;

  /**
   * The conditions this middleware to run.
   * @since 2.0.0
   */
  public readonly conditions: Middleware.Conditions;

  public constructor(options: Middleware.Options) {
    const { name, position, conditions } = options;

    this.name = name;
    this.position = position;
    this.conditions = conditions;
  }

  /**
   * Initiates this class with it's store.
   * @since 2.0.0
   * @param store The store to set to `this`.
   * @returns Returns the current Middleware class.
   */
  public init(store: MiddlewareStore<StoredValue>): this {
    this.store = store;

    return this;
  }

  public [Method.AutoKey](payload: Payloads.AutoKey): Awaitable<Payloads.AutoKey> {
    return payload;
  }

  public [Method.Clear](payload: Payloads.Clear): Awaitable<Payloads.Clear> {
    return payload;
  }

  public [Method.Dec](payload: Payloads.Dec): Awaitable<Payloads.Dec> {
    return payload;
  }

  public [Method.Delete](payload: Payloads.Delete): Awaitable<Payloads.Delete> {
    return payload;
  }

  public [Method.DeleteMany](payload: Payloads.DeleteMany): Awaitable<Payloads.DeleteMany> {
    return payload;
  }

  public [Method.Ensure](payload: Payloads.Ensure<StoredValue>): Awaitable<Payloads.Ensure<StoredValue>> {
    return payload;
  }

  public [Method.Every]<StoredValue>(payload: Payloads.Every.ByHook<StoredValue>): Awaitable<Payloads.Every.ByHook<StoredValue>>;
  public [Method.Every](payload: Payloads.Every.ByValue): Awaitable<Payloads.Every.ByValue>;
  public [Method.Every]<StoredValue>(payload: Payloads.Every<StoredValue>): Awaitable<Payloads.Every<StoredValue>>;
  public [Method.Every]<StoredValue>(payload: Payloads.Every<StoredValue>): Awaitable<Payloads.Every<StoredValue>> {
    return payload;
  }

  public [Method.Filter](payload: Payloads.Filter.ByHook<StoredValue>): Awaitable<Payloads.Filter.ByHook<StoredValue>>;
  public [Method.Filter](payload: Payloads.Filter.ByValue<StoredValue>): Awaitable<Payloads.Filter.ByValue<StoredValue>>;
  public [Method.Filter](payload: Payloads.Filter<StoredValue>): Awaitable<Payloads.Filter<StoredValue>>;
  public [Method.Filter](payload: Payloads.Filter<StoredValue>): Awaitable<Payloads.Filter<StoredValue>> {
    return payload;
  }

  public [Method.Find](payload: Payloads.Find.ByHook<StoredValue>): Awaitable<Payloads.Find.ByHook<StoredValue>>;
  public [Method.Find](payload: Payloads.Find.ByValue<StoredValue>): Awaitable<Payloads.Find.ByValue<StoredValue>>;
  public [Method.Find](payload: Payloads.Find<StoredValue>): Awaitable<Payloads.Find<StoredValue>>;
  public [Method.Find](payload: Payloads.Find<StoredValue>): Awaitable<Payloads.Find<StoredValue>> {
    return payload;
  }

  public [Method.Get]<Value>(payload: Payloads.Get<Value>): Awaitable<Payloads.Get<Value>> {
    return payload;
  }

  public [Method.GetAll](payload: Payloads.GetAll<StoredValue>): Awaitable<Payloads.GetAll<StoredValue>> {
    return payload;
  }

  public [Method.GetMany](payload: Payloads.GetMany<StoredValue>): Awaitable<Payloads.GetMany<StoredValue>> {
    return payload;
  }

  public [Method.Has](payload: Payloads.Has): Awaitable<Payloads.Has> {
    return payload;
  }

  public [Method.Inc](payload: Payloads.Inc): Awaitable<Payloads.Inc> {
    return payload;
  }

  public [Method.Keys](payload: Payloads.Keys): Awaitable<Payloads.Keys> {
    return payload;
  }

  public [Method.Map]<Value = StoredValue>(payload: Payloads.Map.ByHook<StoredValue, Value>): Awaitable<Payloads.Map.ByHook<StoredValue, Value>>;
  public [Method.Map]<Value>(payload: Payloads.Map.ByPath<Value>): Awaitable<Payloads.Map.ByPath<Value>>;
  public [Method.Map]<Value = StoredValue>(payload: Payloads.Map<StoredValue, Value>): Awaitable<Payloads.Map<StoredValue, Value>>;
  public [Method.Map]<Value = StoredValue>(payload: Payloads.Map<StoredValue, Value>): Awaitable<Payloads.Map<StoredValue, Value>> {
    return payload;
  }

  public [Method.Math](payload: Payloads.Math): Awaitable<Payloads.Math> {
    return payload;
  }

  public [Method.Partition](payload: Payloads.Partition.ByHook<StoredValue>): Awaitable<Payloads.Partition.ByHook<StoredValue>>;
  public [Method.Partition](payload: Payloads.Partition.ByValue<StoredValue>): Awaitable<Payloads.Partition.ByValue<StoredValue>>;
  public [Method.Partition](payload: Payloads.Partition<StoredValue>): Awaitable<Payloads.Partition<StoredValue>>;
  public [Method.Partition](payload: Payloads.Partition<StoredValue>): Awaitable<Payloads.Partition<StoredValue>> {
    return payload;
  }

  public [Method.Push]<Value>(payload: Payloads.Push<Value>): Awaitable<Payloads.Push<Value>> {
    return payload;
  }

  public [Method.Random](payload: Payloads.Random<StoredValue>): Awaitable<Payloads.Random<StoredValue>> {
    return payload;
  }

  public [Method.RandomKey](payload: Payloads.RandomKey): Awaitable<Payloads.RandomKey> {
    return payload;
  }

  public [Method.Remove]<StoredValue>(payload: Payloads.Remove.ByHook<StoredValue>): Awaitable<Payloads.Remove.ByHook<StoredValue>>;
  public [Method.Remove](payload: Payloads.Remove.ByValue): Awaitable<Payloads.Remove.ByValue>;
  public [Method.Remove]<StoredValue>(payload: Payloads.Remove<StoredValue>): Awaitable<Payloads.Remove<StoredValue>>;
  public [Method.Remove]<StoredValue>(payload: Payloads.Remove<StoredValue>): Awaitable<Payloads.Remove<StoredValue>> {
    return payload;
  }

  public [Method.Set]<Value>(payload: Payloads.Set<Value>): Awaitable<Payloads.Set<Value>> {
    return payload;
  }

  public [Method.SetMany](payload: Payloads.SetMany): Awaitable<Payloads.SetMany> {
    return payload;
  }

  public [Method.Size](payload: Payloads.Size): Awaitable<Payloads.Size> {
    return payload;
  }

  public [Method.Some]<StoredValue>(payload: Payloads.Some.ByHook<StoredValue>): Awaitable<Payloads.Some.ByHook<StoredValue>>;
  public [Method.Some]<Value>(payload: Payloads.Some.ByValue): Awaitable<Payloads.Some.ByValue>;
  public [Method.Some]<StoredValue>(payload: Payloads.Some<StoredValue>): Awaitable<Payloads.Some<StoredValue>>;
  public [Method.Some]<StoredValue>(payload: Payloads.Some<StoredValue>): Awaitable<Payloads.Some<StoredValue>> {
    return payload;
  }

  public [Method.Update]<Value = StoredValue>(payload: Payloads.Update<StoredValue, Value>): Awaitable<Payloads.Update<StoredValue, Value>> {
    return payload;
  }

  public [Method.Values](payload: Payloads.Values<StoredValue>): Awaitable<Payloads.Values<StoredValue>> {
    return payload;
  }

  public run<P extends Payload>(payload: P): Awaitable<unknown> {
    return payload;
  }

  /**
   * Adds the options of this class to an object.
   * @since 2.0.0
   * @returns The options for this middleware as an object.
   */
  public toJSON(): Middleware.JSON {
    return { name: this.name, position: this.position, conditions: this.conditions };
  }

  /**
   * The Josh instance this middleware is currently running on.
   * @since 2.0.0
   */
  protected get instance(): Josh<StoredValue> {
    if (this.store === undefined)
      throw new JoshError({
        identifier: Middleware.Identifiers.StoreNotFound,
        message: 'The "store" property is undefined. This usually means this middleware has not been initiated.'
      });

    return this.store.instance;
  }

  /**
   * The provider that is used with the current Josh.
   * @since 2.0.0
   */
  protected get provider(): JoshProvider<StoredValue> {
    return this.instance.provider;
  }
}

export namespace Middleware {
  /**
   * The options for {@link Middleware}
   * @since 2.0.0
   */
  export interface Options {
    /**
     * The name of this middleware.
     * @since 2.0.0
     */
    name: string;

    /**
     * The position at which this middleware runs at.
     * @since 2.0.0
     */
    position?: number;

    /**
     * The conditions for this middleware to run on.
     * @since 2.0.0
     */
    conditions: Conditions;
  }

  /**
   * The conditions to run this middleware on.
   * @since 2.0.0
   */
  export interface Conditions {
    /**
     * The `pre` provider method conditions to run at.
     * @since 2.0.0
     */
    pre: Method[];

    /**
     * The `post` provider method conditions to run at.
     * @since 2.0.0
     */
    post: Method[];
  }

  /**
   * The options in an object for {@link Middleware}
   * @since 2.0.0
   */
  export interface JSON {
    /**
     * The name of this middleware.
     * @since 2.0.0
     */
    name: string;

    /**
     * The position of this middleware.
     * @since 2.0.0
     */
    position?: number;

    /**
     * The conditions for this middleware.
     * @since 2.0.0
     */
    conditions: Conditions;
  }

  /**
   * The context data to use for middleware.
   * @since 2.0.0
   */
  export interface ContextData {}

  export enum Identifiers {
    StoreNotFound = 'storeNotFound'
  }
}
