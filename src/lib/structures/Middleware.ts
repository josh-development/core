import { Piece, PieceContext, PieceOptions } from '@sapphire/pieces';
import type { Awaited } from '@sapphire/utilities';
import { JoshError } from '../errors/JoshError';
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
import { Method, Trigger } from '../types';
import type { MiddlewareStore } from './MiddlewareStore';

/**
 * The base class piece for creating middlewares. Extend this piece to create a middleware.
 * @see {@link Middleware.Options} for all available options for middlewares.
 * @since 2.0.0
 *
 * @example
 * ```typescript
 * (at)ApplyOptions<MiddlewareOptions>({
 *   name: 'middleware',
 *   // More options...
 * })
 * export class CoreMiddleware extends Middleware {
 *   // Make method implementations...
 * }
 * ```
 */
export class Middleware<Context extends Middleware.Context = Middleware.Context> extends Piece {
	/**
	 * The store for this middleware.
	 * @since 2.0.0
	 */
	public declare store: MiddlewareStore;

	/**
	 * The position of this middleware.
	 * @since 2.0.0
	 */
	public readonly position?: number;

	/**
	 * The conditions of this middleware.
	 * @since 2.0.0
	 */
	public readonly conditions: Middleware.Condition[];

	/**
	 * Whether to use this middleware or not.
	 * @since 2.0.0
	 * @default true
	 */
	public use: boolean;

	public constructor(context: PieceContext, options: Middleware.Options = {}) {
		super(context, options);

		const { position, conditions, use } = options;

		if (!conditions)
			throw new JoshError({
				identifier: Middleware.Identifiers.MissingConditions,
				message: 'The "conditions" property is a required Middleware option.'
			});

		this.position = position;
		this.conditions = conditions;
		this.use = use ?? true;
	}

	public [Method.AutoKey](payload: AutoKeyPayload): Awaited<AutoKeyPayload> {
		return payload;
	}

	public [Method.Clear](payload: ClearPayload): Awaited<ClearPayload> {
		return payload;
	}

	public [Method.Dec](payload: DecPayload): Awaited<DecPayload> {
		return payload;
	}

	public [Method.Delete](payload: DeletePayload): Awaited<DeletePayload> {
		return payload;
	}

	public [Method.Ensure]<StoredValue>(payload: EnsurePayload<StoredValue>): Awaited<EnsurePayload<StoredValue>> {
		return payload;
	}

	public [Method.Every]<HookValue>(payload: EveryByHookPayload<HookValue>): Awaited<EveryByHookPayload<HookValue>>;
	public [Method.Every](payload: EveryByValuePayload): Awaited<EveryByValuePayload>;
	public [Method.Every]<HookValue>(payload: EveryPayload<HookValue>): Awaited<EveryPayload<HookValue>>;
	public [Method.Every]<HookValue>(payload: EveryPayload<HookValue>): Awaited<EveryPayload<HookValue>> {
		return payload;
	}

	public [Method.Filter]<StoredValue>(payload: FilterByHookPayload<StoredValue>): Awaited<FilterByHookPayload<StoredValue>>;
	public [Method.Filter]<StoredValue>(payload: FilterByValuePayload<StoredValue>): Awaited<FilterByValuePayload<StoredValue>>;
	public [Method.Filter]<StoredValue>(payload: FilterPayload<StoredValue>): Awaited<FilterPayload<StoredValue>>;
	public [Method.Filter]<StoredValue>(payload: FilterPayload<StoredValue>): Awaited<FilterPayload<StoredValue>> {
		return payload;
	}

	public [Method.Find]<StoredValue>(payload: FindByHookPayload<StoredValue>): Awaited<FindByHookPayload<StoredValue>>;
	public [Method.Find]<StoredValue>(payload: FindByValuePayload<StoredValue>): Awaited<FindByValuePayload<StoredValue>>;
	public [Method.Find]<StoredValue>(payload: FindPayload<StoredValue>): Awaited<FindPayload<StoredValue>>;
	public [Method.Find]<StoredValue>(payload: FindPayload<StoredValue>): Awaited<FindPayload<StoredValue>> {
		return payload;
	}

	public [Method.Get]<DataValue>(payload: GetPayload<DataValue>): Awaited<GetPayload<DataValue>> {
		return payload;
	}

	public [Method.GetAll]<DataValue>(payload: GetAllPayload<DataValue>): Awaited<GetAllPayload<DataValue>> {
		return payload;
	}

	public [Method.GetMany]<DataValue>(payload: GetManyPayload<DataValue>): Awaited<GetManyPayload<DataValue>> {
		return payload;
	}

	public [Method.Has](payload: HasPayload): Awaited<HasPayload> {
		return payload;
	}

	public [Method.Inc](payload: IncPayload): Awaited<IncPayload> {
		return payload;
	}

	public [Method.Keys](payload: KeysPayload): Awaited<KeysPayload> {
		return payload;
	}

	public [Method.Map]<Value, HookValue>(payload: MapByHookPayload<Value, HookValue>): Awaited<MapByHookPayload<Value, HookValue>>;
	public [Method.Map]<Value>(payload: MapByPathPayload<Value>): Awaited<MapByPathPayload<Value>>;
	public [Method.Map]<Value, HookValue>(payload: MapPayload<Value, HookValue>): Awaited<MapPayload<Value, HookValue>>;
	public [Method.Map]<Value, HookValue>(payload: MapPayload<Value, HookValue>): Awaited<MapPayload<Value, HookValue>> {
		return payload;
	}

	public [Method.Partition]<StoredValue>(payload: PartitionByHookPayload<StoredValue>): Awaited<PartitionByHookPayload<StoredValue>>;
	public [Method.Partition]<StoredValue>(payload: PartitionByValuePayload<StoredValue>): Awaited<PartitionByValuePayload<StoredValue>>;
	public [Method.Partition]<StoredValue>(payload: PartitionPayload<StoredValue>): Awaited<PartitionPayload<StoredValue>>;
	public [Method.Partition]<StoredValue>(payload: PartitionPayload<StoredValue>): Awaited<PartitionPayload<StoredValue>> {
		return payload;
	}

	public [Method.Push]<Value>(payload: PushPayload<Value>): Awaited<PushPayload<Value>> {
		return payload;
	}

	public [Method.Random]<StoredValue>(payload: RandomPayload<StoredValue>): Awaited<RandomPayload<StoredValue>> {
		return payload;
	}

	public [Method.RandomKey](payload: RandomKeyPayload): Awaited<RandomKeyPayload> {
		return payload;
	}

	public [Method.Remove]<HookValue>(payload: RemoveByHookPayload<HookValue>): Awaited<RemoveByHookPayload<HookValue>>;
	public [Method.Remove](payload: RemoveByValuePayload): Awaited<RemoveByValuePayload>;
	public [Method.Remove]<HookValue>(payload: RemovePayload<HookValue>): Awaited<RemovePayload<HookValue>>;
	public [Method.Remove]<HookValue>(payload: RemovePayload<HookValue>): Awaited<RemovePayload<HookValue>> {
		return payload;
	}

	public [Method.Set]<Value>(payload: SetPayload<Value>): Awaited<SetPayload<Value>> {
		return payload;
	}

	public [Method.SetMany]<StoredValue>(payload: SetManyPayload<StoredValue>): Awaited<SetManyPayload<StoredValue>> {
		return payload;
	}

	public [Method.Size](payload: SizePayload): Awaited<SizePayload> {
		return payload;
	}

	public [Method.Some]<HookValue>(payload: SomeByHookPayload<HookValue>): Awaited<SomeByHookPayload<HookValue>>;
	public [Method.Some]<Value>(payload: SomeByValuePayload): Awaited<SomeByValuePayload>;
	public [Method.Some]<HookValue>(payload: SomePayload<HookValue>): Awaited<SomePayload<HookValue>>;
	public [Method.Some]<HookValue>(payload: SomePayload<HookValue>): Awaited<SomePayload<HookValue>> {
		return payload;
	}

	public [Method.Update]<StoredValue, Value, HookValue>(
		payload: UpdatePayload<StoredValue, Value, HookValue>
	): Awaited<UpdatePayload<StoredValue, Value, HookValue>> {
		return payload;
	}

	public [Method.Values]<StoredValue>(payload: ValuesPayload<StoredValue>): Awaited<ValuesPayload<StoredValue>> {
		return payload;
	}

	public run<P extends Payload>(payload: P): Awaited<unknown> {
		return payload;
	}

	public toJSON() {
		return { ...super.toJSON(), position: this.position, conditions: this.conditions, use: this.use };
	}

	/**
	 * Retrieve this middleware'es context data from the Josh instance.
	 * @since 2.0.0
	 * @returns The context or `undefined`
	 */
	protected getContext<C extends Middleware.Context = Context>(): C | undefined {
		const contextData = this.instance.options.middlewareContextData ?? {};

		return Reflect.get(contextData, this.name);
	}

	/**
	 * Get this middleware's Josh instance.
	 * @since 2.0.0
	 */
	protected get instance() {
		return this.store.instance;
	}

	/**
	 * Get this middleware's provider instance.
	 * @since 2.0.0
	 */
	protected get provider() {
		return this.instance.provider;
	}
}

export namespace Middleware {
	/**
	 * The options for {@link Middleware}
	 * @since 2.0.0
	 */
	export interface Options extends PieceOptions {
		/**
		 * The position at which this middleware runs at.
		 * @since 2.0.0
		 */
		position?: number;

		/**
		 * The conditions for this middleware to run on.
		 * @since 2.0.0
		 */
		conditions?: Condition[];

		/**
		 * Whether this middleware is enabled or not.
		 * @since 2.0.0
		 */
		use?: boolean;
	}

	/**
	 * The middleware context base interface.
	 * @since 2.0.0
	 */
	export interface Context {}

	/**
	 * A middleware condition to run on.
	 * @since 2.0.0
	 */
	export interface Condition {
		/**
		 * The methods for this condition.
		 * @since 2.0.0
		 */
		methods: Method[];

		/**
		 * The trigger for this condition.
		 */
		trigger: Trigger;
	}

	export enum Identifiers {
		MissingConditions = 'missingConditions'
	}
}
