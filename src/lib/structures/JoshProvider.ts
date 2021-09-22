import type { Awaited } from '@sapphire/utilities';
import type { JoshProviderError } from '../errors';
import type {
	AutoKeyPayload,
	ClearPayload,
	DecPayload,
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
	public abstract [Method.AutoKey](payload: AutoKeyPayload): Awaited<AutoKeyPayload>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Clear](payload: ClearPayload): Awaited<ClearPayload>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Dec](payload: DecPayload): Awaited<DecPayload>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Delete](payload: DeletePayload): Awaited<DeletePayload>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Ensure](payload: EnsurePayload<StoredValue>): Awaited<EnsurePayload<StoredValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Every]<HookValue>(payload: EveryByHookPayload<HookValue>): Awaited<EveryByHookPayload<HookValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Every]<Value>(payload: EveryByValuePayload): Awaited<EveryByValuePayload>;
	public abstract [Method.Every]<HookValue>(payload: EveryPayload<HookValue>): Awaited<EveryPayload<HookValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Filter](payload: FilterByHookPayload<StoredValue>): Awaited<FilterByHookPayload<StoredValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Filter](payload: FilterByValuePayload<StoredValue>): Awaited<FilterByValuePayload<StoredValue>>;
	public abstract [Method.Filter](payload: FilterPayload<StoredValue>): Awaited<FilterPayload<StoredValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Find](payload: FindByHookPayload<StoredValue>): Awaited<FindByHookPayload<StoredValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Find](payload: FindByValuePayload<StoredValue>): Awaited<FindByValuePayload<StoredValue>>;
	public abstract [Method.Find](payload: FindPayload<StoredValue>): Awaited<FindPayload<StoredValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Get]<DataValue>(payload: GetPayload<DataValue>): Awaited<GetPayload<DataValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.GetAll](payload: GetAllPayload<StoredValue>): Awaited<GetAllPayload<StoredValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.GetMany](payload: GetManyPayload<StoredValue>): Awaited<GetManyPayload<StoredValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Has](payload: HasPayload): Awaited<HasPayload>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Inc](payload: IncPayload): Awaited<IncPayload>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Keys](payload: KeysPayload): Awaited<KeysPayload>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Map]<Value, HookValue>(payload: MapByHookPayload<Value, HookValue>): Awaited<MapByHookPayload<Value, HookValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Map]<Value = StoredValue>(payload: MapByPathPayload<Value>): Awaited<MapByPathPayload<Value>>;
	public abstract [Method.Map]<Value = StoredValue, HookValue = Value>(payload: MapPayload<Value, HookValue>): Awaited<MapPayload<Value, HookValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Math](payload: MathPayload): Awaited<MathPayload>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Partition](payload: PartitionByHookPayload<StoredValue>): Awaited<PartitionByHookPayload<StoredValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Partition](payload: PartitionByValuePayload<StoredValue>): Awaited<PartitionByValuePayload<StoredValue>>;
	public abstract [Method.Partition](payload: PartitionPayload<StoredValue>): Awaited<PartitionPayload<StoredValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Push]<Value>(payload: PushPayload<Value>): Awaited<PushPayload<Value>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Random](payload: RandomPayload<StoredValue>): Awaited<RandomPayload<StoredValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.RandomKey](payload: RandomKeyPayload): Awaited<RandomKeyPayload>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Remove]<HookValue>(payload: RemoveByHookPayload<HookValue>): Awaited<RemoveByHookPayload<HookValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Remove]<Value>(payload: RemoveByValuePayload): Awaited<RemoveByValuePayload>;
	public abstract [Method.Remove]<HookValue>(payload: RemovePayload<HookValue>): Awaited<RemovePayload<HookValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Set]<Value = StoredValue>(payload: SetPayload<Value>): Awaited<SetPayload<Value>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.SetMany](payload: SetManyPayload<StoredValue>): Awaited<SetManyPayload<StoredValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Size](payload: SizePayload): Awaited<SizePayload>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Some]<HookValue>(payload: SomeByHookPayload<HookValue>): Awaited<SomeByHookPayload<HookValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Some]<Value>(payload: SomeByValuePayload): Awaited<SomeByValuePayload>;
	public abstract [Method.Some]<HookValue>(payload: SomePayload<HookValue>): Awaited<SomePayload<HookValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Update]<Value, HookValue>(
		payload: UpdatePayload<StoredValue, Value, HookValue>
	): Awaited<UpdatePayload<StoredValue, Value, HookValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract [Method.Values](payload: ValuesPayload<StoredValue>): Awaited<ValuesPayload<StoredValue>>;
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
		 * The error of this context.
		 * @since 2.0.0
		 */
		error?: JoshProviderError;
	}
}
