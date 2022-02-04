import type { Awaitable } from '@sapphire/utilities';
import { JoshError } from '../errors';
import type {
  AutoKeyPayload,
  ClearPayload,
  DecPayload,
  DeleteManyPayload,
  DeletePayload,
  EnsurePayload,
  EveryByHookPayload,
  EveryByValuePayload,
  EveryPayload,
  FilterByHookPayload,
  FilterByValuePayload,
  FilterPayload,
  FindByHookPayload,
  FindByValuePayload,
  FindPayload,
  GetAllPayload,
  GetManyPayload,
  GetPayload,
  HasPayload,
  IncPayload,
  KeysPayload,
  MapByHookPayload,
  MapByPathPayload,
  MapPayload,
  MathPayload,
  PartitionByHookPayload,
  PartitionByValuePayload,
  PartitionPayload,
  Payload,
  PushPayload,
  RandomKeyPayload,
  RandomPayload,
  RemoveByHookPayload,
  RemoveByValuePayload,
  RemovePayload,
  SetManyPayload,
  SetPayload,
  SizePayload,
  SomeByHookPayload,
  SomeByValuePayload,
  SomePayload,
  UpdatePayload,
  ValuesPayload
} from '../payloads';
import { Method } from '../types';
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

  public [Method.AutoKey](payload: AutoKeyPayload): Awaitable<AutoKeyPayload> {
    return payload;
  }

  public [Method.Clear](payload: ClearPayload): Awaitable<ClearPayload> {
    return payload;
  }

  public [Method.Dec](payload: DecPayload): Awaitable<DecPayload> {
    return payload;
  }

  public [Method.Delete](payload: DeletePayload): Awaitable<DeletePayload> {
    return payload;
  }

  public [Method.DeleteMany](payload: DeleteManyPayload): Awaitable<DeleteManyPayload> {
    return payload;
  }

  public [Method.Ensure](payload: EnsurePayload<StoredValue>): Awaitable<EnsurePayload<StoredValue>> {
    return payload;
  }

  public [Method.Every]<HookValue>(payload: EveryByHookPayload<HookValue>): Awaitable<EveryByHookPayload<HookValue>>;
  public [Method.Every](payload: EveryByValuePayload): Awaitable<EveryByValuePayload>;
  public [Method.Every]<HookValue>(payload: EveryPayload<HookValue>): Awaitable<EveryPayload<HookValue>>;
  public [Method.Every]<HookValue>(payload: EveryPayload<HookValue>): Awaitable<EveryPayload<HookValue>> {
    return payload;
  }

  public [Method.Filter](payload: FilterByHookPayload<StoredValue>): Awaitable<FilterByHookPayload<StoredValue>>;
  public [Method.Filter](payload: FilterByValuePayload<StoredValue>): Awaitable<FilterByValuePayload<StoredValue>>;
  public [Method.Filter](payload: FilterPayload<StoredValue>): Awaitable<FilterPayload<StoredValue>>;
  public [Method.Filter](payload: FilterPayload<StoredValue>): Awaitable<FilterPayload<StoredValue>> {
    return payload;
  }

  public [Method.Find](payload: FindByHookPayload<StoredValue>): Awaitable<FindByHookPayload<StoredValue>>;
  public [Method.Find](payload: FindByValuePayload<StoredValue>): Awaitable<FindByValuePayload<StoredValue>>;
  public [Method.Find](payload: FindPayload<StoredValue>): Awaitable<FindPayload<StoredValue>>;
  public [Method.Find](payload: FindPayload<StoredValue>): Awaitable<FindPayload<StoredValue>> {
    return payload;
  }

  public [Method.Get]<DataValue>(payload: GetPayload<DataValue>): Awaitable<GetPayload<DataValue>> {
    return payload;
  }

  public [Method.GetAll]<DataValue>(payload: GetAllPayload<DataValue>): Awaitable<GetAllPayload<DataValue>> {
    return payload;
  }

  public [Method.GetMany]<DataValue>(payload: GetManyPayload<DataValue>): Awaitable<GetManyPayload<DataValue>> {
    return payload;
  }

  public [Method.Has](payload: HasPayload): Awaitable<HasPayload> {
    return payload;
  }

  public [Method.Inc](payload: IncPayload): Awaitable<IncPayload> {
    return payload;
  }

  public [Method.Keys](payload: KeysPayload): Awaitable<KeysPayload> {
    return payload;
  }

  public [Method.Map]<Value, HookValue>(payload: MapByHookPayload<Value, HookValue>): Awaitable<MapByHookPayload<Value, HookValue>>;
  public [Method.Map]<Value>(payload: MapByPathPayload<Value>): Awaitable<MapByPathPayload<Value>>;
  public [Method.Map]<Value, HookValue>(payload: MapPayload<Value, HookValue>): Awaitable<MapPayload<Value, HookValue>>;
  public [Method.Map]<Value, HookValue>(payload: MapPayload<Value, HookValue>): Awaitable<MapPayload<Value, HookValue>> {
    return payload;
  }

  public [Method.Math](payload: MathPayload): Awaitable<MathPayload> {
    return payload;
  }

  public [Method.Partition](payload: PartitionByHookPayload<StoredValue>): Awaitable<PartitionByHookPayload<StoredValue>>;
  public [Method.Partition](payload: PartitionByValuePayload<StoredValue>): Awaitable<PartitionByValuePayload<StoredValue>>;
  public [Method.Partition](payload: PartitionPayload<StoredValue>): Awaitable<PartitionPayload<StoredValue>>;
  public [Method.Partition](payload: PartitionPayload<StoredValue>): Awaitable<PartitionPayload<StoredValue>> {
    return payload;
  }

  public [Method.Push]<Value>(payload: PushPayload<Value>): Awaitable<PushPayload<Value>> {
    return payload;
  }

  public [Method.Random](payload: RandomPayload<StoredValue>): Awaitable<RandomPayload<StoredValue>> {
    return payload;
  }

  public [Method.RandomKey](payload: RandomKeyPayload): Awaitable<RandomKeyPayload> {
    return payload;
  }

  public [Method.Remove]<HookValue>(payload: RemoveByHookPayload<HookValue>): Awaitable<RemoveByHookPayload<HookValue>>;
  public [Method.Remove](payload: RemoveByValuePayload): Awaitable<RemoveByValuePayload>;
  public [Method.Remove]<HookValue>(payload: RemovePayload<HookValue>): Awaitable<RemovePayload<HookValue>>;
  public [Method.Remove]<HookValue>(payload: RemovePayload<HookValue>): Awaitable<RemovePayload<HookValue>> {
    return payload;
  }

  public [Method.Set]<Value>(payload: SetPayload<Value>): Awaitable<SetPayload<Value>> {
    return payload;
  }

  public [Method.SetMany]<Value = StoredValue>(payload: SetManyPayload<Value>): Awaitable<SetManyPayload<Value>> {
    return payload;
  }

  public [Method.Size](payload: SizePayload): Awaitable<SizePayload> {
    return payload;
  }

  public [Method.Some]<HookValue>(payload: SomeByHookPayload<HookValue>): Awaitable<SomeByHookPayload<HookValue>>;
  public [Method.Some]<Value>(payload: SomeByValuePayload): Awaitable<SomeByValuePayload>;
  public [Method.Some]<HookValue>(payload: SomePayload<HookValue>): Awaitable<SomePayload<HookValue>>;
  public [Method.Some]<HookValue>(payload: SomePayload<HookValue>): Awaitable<SomePayload<HookValue>> {
    return payload;
  }

  public [Method.Update]<StoredValue, Value, HookValue>(
    payload: UpdatePayload<StoredValue, Value, HookValue>
  ): Awaitable<UpdatePayload<StoredValue, Value, HookValue>> {
    return payload;
  }

  public [Method.Values](payload: ValuesPayload<StoredValue>): Awaitable<ValuesPayload<StoredValue>> {
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
