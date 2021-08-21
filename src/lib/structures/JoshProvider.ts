import type { Awaited } from '@sapphire/utilities';
import type { JoshProviderError } from '../errors';
import type {
	AutoKeyPayload,
	DecPayload,
	DeletePayload,
	EnsurePayload,
	EveryByDataPayload,
	EveryByHookPayload,
	FilterByDataPayload,
	FilterByHookPayload,
	FindByDataPayload,
	FindByHookPayload,
	GetAllPayload,
	GetManyPayload,
	GetPayload,
	HasPayload,
	IncPayload,
	KeysPayload,
	MapByHookPayload,
	MapByPathPayload,
	PushPayload,
	RandomKeyPayload,
	RandomPayload,
	RemoveByDataPayload,
	RemoveByHookPayload,
	SetManyPayload,
	SetPayload,
	SizePayload,
	SomeByDataPayload,
	SomeByHookPayload,
	UpdateByDataPayload,
	UpdateByHookPayload,
	ValuesPayload
} from '../payloads';
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
export abstract class JoshProvider<Value = unknown> {
	/**
	 * The name for this provider.
	 * @since 2.0.0
	 */
	public name?: string;

	/**
	 * The {@link Josh} instance for this provider.
	 * @since 2.0.0
	 */
	public instance?: Josh<Value>;

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
	public async init(context: JoshProvider.Context<Value>): Promise<JoshProvider.Context<Value>> {
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
	public abstract autoKey(payload: AutoKeyPayload): Awaited<AutoKeyPayload>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract dec(payload: DecPayload): Awaited<DecPayload>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract delete(payload: DeletePayload): Awaited<DeletePayload>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract ensure<CustomValue = Value>(payload: EnsurePayload<CustomValue>): Awaited<EnsurePayload<CustomValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract everyByData<CustomValue = Value>(payload: EveryByDataPayload<CustomValue>): Awaited<EveryByDataPayload<CustomValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract everyByHook<CustomValue = Value>(payload: EveryByHookPayload<CustomValue>): Awaited<EveryByHookPayload<CustomValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract filterByData<CustomValue = Value>(payload: FilterByDataPayload<CustomValue>): Awaited<FilterByDataPayload<CustomValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract filterByHook<CustomValue = Value>(payload: FilterByHookPayload<CustomValue>): Awaited<FilterByHookPayload<CustomValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract findByData<CustomValue = Value>(payload: FindByDataPayload<CustomValue>): Awaited<FindByDataPayload<CustomValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract findByHook<CustomValue = Value>(payload: FindByHookPayload<CustomValue>): Awaited<FindByHookPayload<CustomValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract get<CustomValue = Value>(payload: GetPayload<CustomValue>): Awaited<GetPayload<CustomValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract getAll<CustomValue = Value>(payload: GetAllPayload<CustomValue>): Awaited<GetAllPayload<CustomValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract getMany<CustomValue = Value>(payload: GetManyPayload<CustomValue>): Awaited<GetManyPayload<CustomValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract has(payload: HasPayload): Awaited<HasPayload>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract inc(payload: IncPayload): Awaited<IncPayload>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract keys(payload: KeysPayload): Awaited<KeysPayload>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract mapByPath<CustomValue = Value>(payload: MapByPathPayload<CustomValue>): Awaited<MapByPathPayload<CustomValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract mapByHook<CustomValue = Value>(payload: MapByHookPayload<CustomValue>): Awaited<MapByHookPayload<CustomValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract push<CustomValue = Value>(payload: PushPayload, value: CustomValue): Awaited<PushPayload>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract random<CustomValue = Value>(payload: RandomPayload<CustomValue>): Awaited<RandomPayload<CustomValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract randomKey(payload: RandomKeyPayload): Awaited<RandomKeyPayload>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract removeByData<CustomValue = Value>(payload: RemoveByDataPayload<CustomValue>): Awaited<RemoveByDataPayload<CustomValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract removeByHook<CustomValue = Value>(payload: RemoveByHookPayload<CustomValue>): Awaited<RemoveByHookPayload<CustomValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract set<CustomValue = Value>(payload: SetPayload, value: CustomValue): Awaited<SetPayload>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract setMany<CustomValue = Value>(payload: SetManyPayload, value: CustomValue): Awaited<SetManyPayload>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract size(payload: SizePayload): Awaited<SizePayload>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract someByData<CustomValue = Value>(payload: SomeByDataPayload<CustomValue>): Awaited<SomeByDataPayload<CustomValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract someByHook<CustomValue = Value>(payload: SomeByHookPayload<CustomValue>): Awaited<SomeByHookPayload<CustomValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract updateByData<CustomValue = Value>(payload: UpdateByDataPayload<CustomValue>): Awaited<UpdateByDataPayload<CustomValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract updateByHook<CustomValue = Value>(payload: UpdateByHookPayload<CustomValue>): Awaited<UpdateByHookPayload<CustomValue>>;

	/**
	 * @since 2.0.0
	 * @param payload The payload sent by this provider's {@link Josh} instance.
	 * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
	 */
	public abstract values<CustomValue = Value>(payload: ValuesPayload<CustomValue>): Awaited<ValuesPayload<CustomValue>>;
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
