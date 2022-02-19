import type { Awaitable } from '@sapphire/utilities';
import { JoshProviderError, JoshProviderErrorOptions } from '../errors';
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
import type { Method } from '../types';
import type { Josh } from './Josh';

/**
 * The base provider class. Extend this class to create your own provider.
 *
 * NOTE: If you want an example of how to use this class please see `src/lib/structures/defaultProvider/MapProvider.ts`
 *
 * @see {@link JoshProvider.Options} for all options available to the JoshProvider class.
 *
 * @since 2.0.0
 * @example
 * ```typescript
 * export class Provider extends JoshProvider {
 *   // Implement methods...
 * }
 * ```
 */
export abstract class JoshProvider<StoredValue = unknown> {
  /**
   * The name for this provider.
   * @since 2.0.0
   */
  public name?: string;

  /**
   * The {@link Josh} instance for this provider.
   * @since 2.0.0
   */
  public instance?: Josh<StoredValue>;

  /**
   * The options for this provider.
   * @since 2.0.0
   */
  public options: JoshProvider.Options;

  public constructor(options: JoshProvider.Options = {}) {
    this.options = options;
  }

  /**
   * Initialize the provider.
   * @since 2.0.0
   * @param context The provider's context sent by this provider's {@link Josh} instance.
   * @returns The provider's context.
   *
   * @example
   * ```typescript
   * public async init(context: JoshProvider.Context<Value>): Promise<JoshProvider.Context<Value>> {
   *   // Initialize provider...
   *   context = await super.init(context);
   *   // Initialize provider...
   *   return context;
   * }
   * ```
   */
  public async init(context: JoshProvider.Context<StoredValue>): Promise<JoshProvider.Context<StoredValue>> {
    const { name, instance } = context;

    this.name = name;
    this.instance = instance;

    return Promise.resolve(context);
  }

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.AutoKey](payload: AutoKeyPayload): Awaitable<AutoKeyPayload>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Clear](payload: ClearPayload): Awaitable<ClearPayload>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Dec](payload: DecPayload): Awaitable<DecPayload>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Delete](payload: DeletePayload): Awaitable<DeletePayload>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.DeleteMany](payload: DeleteManyPayload): Awaitable<DeleteManyPayload>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Ensure](payload: EnsurePayload<StoredValue>): Awaitable<EnsurePayload<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Every]<HookValue>(payload: EveryByHookPayload<HookValue>): Awaitable<EveryByHookPayload<HookValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Every]<Value>(payload: EveryByValuePayload): Awaitable<EveryByValuePayload>;
  public abstract [Method.Every]<HookValue>(payload: EveryPayload<HookValue>): Awaitable<EveryPayload<HookValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Filter](payload: FilterByHookPayload<StoredValue>): Awaitable<FilterByHookPayload<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Filter](payload: FilterByValuePayload<StoredValue>): Awaitable<FilterByValuePayload<StoredValue>>;
  public abstract [Method.Filter](payload: FilterPayload<StoredValue>): Awaitable<FilterPayload<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Find](payload: FindByHookPayload<StoredValue>): Awaitable<FindByHookPayload<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Find](payload: FindByValuePayload<StoredValue>): Awaitable<FindByValuePayload<StoredValue>>;
  public abstract [Method.Find](payload: FindPayload<StoredValue>): Awaitable<FindPayload<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Get]<DataValue>(payload: GetPayload<DataValue>): Awaitable<GetPayload<DataValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.GetAll](payload: GetAllPayload<StoredValue>): Awaitable<GetAllPayload<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.GetMany](payload: GetManyPayload<StoredValue>): Awaitable<GetManyPayload<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Has](payload: HasPayload): Awaitable<HasPayload>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Inc](payload: IncPayload): Awaitable<IncPayload>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Keys](payload: KeysPayload): Awaitable<KeysPayload>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Map]<Value, HookValue>(payload: MapByHookPayload<Value, HookValue>): Awaitable<MapByHookPayload<Value, HookValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Map]<Value = StoredValue>(payload: MapByPathPayload<Value>): Awaitable<MapByPathPayload<Value>>;
  public abstract [Method.Map]<Value = StoredValue, HookValue = Value>(
    payload: MapPayload<Value, HookValue>
  ): Awaitable<MapPayload<Value, HookValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Math](payload: MathPayload): Awaitable<MathPayload>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Partition](payload: PartitionByHookPayload<StoredValue>): Awaitable<PartitionByHookPayload<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Partition](payload: PartitionByValuePayload<StoredValue>): Awaitable<PartitionByValuePayload<StoredValue>>;
  public abstract [Method.Partition](payload: PartitionPayload<StoredValue>): Awaitable<PartitionPayload<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Push]<Value>(payload: PushPayload<Value>): Awaitable<PushPayload<Value>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Random](payload: RandomPayload<StoredValue>): Awaitable<RandomPayload<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.RandomKey](payload: RandomKeyPayload): Awaitable<RandomKeyPayload>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Remove]<HookValue>(payload: RemoveByHookPayload<HookValue>): Awaitable<RemoveByHookPayload<HookValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Remove]<Value>(payload: RemoveByValuePayload): Awaitable<RemoveByValuePayload>;
  public abstract [Method.Remove]<HookValue>(payload: RemovePayload<HookValue>): Awaitable<RemovePayload<HookValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Set]<Value = StoredValue>(payload: SetPayload<Value>): Awaitable<SetPayload<Value>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.SetMany]<Value = StoredValue>(payload: SetManyPayload<Value>): Awaitable<SetManyPayload<Value>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Size](payload: SizePayload): Awaitable<SizePayload>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Some]<HookValue>(payload: SomeByHookPayload<HookValue>): Awaitable<SomeByHookPayload<HookValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Some]<Value>(payload: SomeByValuePayload): Awaitable<SomeByValuePayload>;
  public abstract [Method.Some]<HookValue>(payload: SomePayload<HookValue>): Awaitable<SomePayload<HookValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Update]<Value, HookValue>(
    payload: UpdatePayload<StoredValue, Value, HookValue>
  ): Awaitable<UpdatePayload<StoredValue, Value, HookValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Values](payload: ValuesPayload<StoredValue>): Awaitable<ValuesPayload<StoredValue>>;

  /**
   * Creates an Josh provider error.
   * @since 2.0.0
   * @param options The options for the error.
   * @returns The error.
   */
  protected error(options: JoshProviderErrorOptions): JoshProviderError {
    return new JoshProviderError({ ...options, name: options.name ?? this.constructor.name });
  }
}

export namespace JoshProvider {
  /**
   * The options to extend for {@link JoshProvider}
   * @since 2.0.0
   *
   * @example
   * ```typescript
   * export namespace Provider {
   *   export interface Options extends JoshProvider.Options {
   *     // Provider options...
   *   }
   * }
   * ```
   */
  export interface Options {}

  /**
   * The context sent by the {@link Josh} instance.
   * @since 2.0.0
   */
  export interface Context<Value = unknown> {
    /**
     * The name of this context.
     * @since 2.0.0
     */
    name: string;

    /**
     * The instance of this context.
     * @since 2.0.0
     */
    instance?: Josh<Value>;

    /**
     * The version of the Josh initiating this provider.
     * @since 2.0.0
     */
    version?: string;

    /**
     * The error of this context.
     * @since 2.0.0
     */
    error?: JoshProviderError;
  }

  export interface Constructor<StoredValue = unknown> {
    new (options: Options): JoshProvider<StoredValue>;
  }

  export enum CommonIdentifiers {
    DecMissingData = 'decMissingData',

    DecInvalidType = 'decInvalidType',

    FilterInvalidValue = 'filterInvalidValue',

    FindInvalidValue = 'findInvalidValue',

    IncInvalidType = 'incInvalidType',

    IncMissingData = 'incMissingData',

    MathInvalidType = 'mathInvalidType',

    MathMissingData = 'mathMissingData',

    PartitionInvalidValue = 'partitionInvalidValue',

    PushInvalidType = 'pushInvalidType',

    PushMissingData = 'pushMissingData',

    RandomInvalidCount = 'randomInvalidCount',

    RandomKeyInvalidCount = 'randomKeyInvalidCount',

    RemoveInvalidType = 'removeInvalidType',

    RemoveMissingData = 'removeMissingData'
  }
}
