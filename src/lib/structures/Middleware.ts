import { Piece, PieceContext, PieceOptions } from '@sapphire/pieces';
import type { Awaited } from '@sapphire/utilities';
import { JoshError } from '../errors/JoshError';
import type {
	AutoKeyPayload,
	DecPayload,
	DeletePayload,
	EnsurePayload,
	FilterByDataPayload,
	FilterByHookPayload,
	FilterPayload,
	FindByDataPayload,
	FindByHookPayload,
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
	Payload,
	PushPayload,
	RandomKeyPayload,
	RandomPayload,
	SetManyPayload,
	SetPayload,
	SizePayload,
	SomeByDataPayload,
	SomeByHookPayload,
	SomePayload,
	UpdateByDataPayload,
	UpdateByHookPayload,
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
export abstract class Middleware<Context extends Middleware.Context = Middleware.Context> extends Piece {
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

	public [Method.Dec](payload: DecPayload): Awaited<DecPayload> {
		return payload;
	}

	public [Method.Delete](payload: DeletePayload): Awaited<DeletePayload> {
		return payload;
	}

	public [Method.Ensure]<Value = unknown>(payload: EnsurePayload<Value>): Awaited<EnsurePayload<Value>> {
		return payload;
	}

	public [Method.Filter]<Value = unknown>(payload: FilterByDataPayload<Value>): Awaited<FilterByDataPayload<Value>>;
	public [Method.Filter]<Value = unknown>(payload: FilterByHookPayload<Value>): Awaited<FilterByHookPayload<Value>>;
	public [Method.Filter]<Value = unknown>(payload: FilterPayload<Value>): Awaited<FilterPayload<Value>> {
		return payload;
	}

	public [Method.Find]<Value = unknown>(payload: FindByDataPayload<Value>): Awaited<FindByDataPayload<Value>>;
	public [Method.Find]<Value = unknown>(payload: FindByHookPayload<Value>): Awaited<FindByHookPayload<Value>>;
	public [Method.Find]<Value = unknown>(payload: FindPayload<Value>): Awaited<FindPayload<Value>> {
		return payload;
	}

	public [Method.Get]<Value = unknown>(payload: GetPayload<Value>): Awaited<GetPayload<Value>> {
		return payload;
	}

	public [Method.GetAll]<Value = unknown>(payload: GetAllPayload<Value>): Awaited<GetAllPayload<Value>> {
		return payload;
	}

	public [Method.GetMany]<Value = unknown>(payload: GetManyPayload<Value>): Awaited<GetManyPayload<Value>> {
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

	public [Method.Map]<Value = unknown>(payload: MapByPathPayload<Value>): Awaited<MapByPathPayload<Value>>;
	public [Method.Map]<Value = unknown>(payload: MapByHookPayload<Value>): Awaited<MapByHookPayload<Value>>;
	public [Method.Map]<Value = unknown>(payload: MapPayload<Value>): Awaited<MapPayload<Value>> {
		return payload;
	}

	public [Method.Push](payload: PushPayload): Awaited<PushPayload> {
		return payload;
	}

	public [Method.Random]<Value = unknown>(payload: RandomPayload<Value>): Awaited<RandomPayload<Value>> {
		return payload;
	}

	public [Method.RandomKey](payload: RandomKeyPayload): Awaited<RandomKeyPayload> {
		return payload;
	}

	public [Method.Set](payload: SetPayload): Awaited<SetPayload> {
		return payload;
	}

	public [Method.SetMany](payload: SetManyPayload): Awaited<SetManyPayload> {
		return payload;
	}

	public [Method.Size](payload: SizePayload): Awaited<SizePayload> {
		return payload;
	}

	public [Method.Some]<Value = unknown>(payload: SomeByDataPayload<Value>): Awaited<SomeByDataPayload<Value>>;
	public [Method.Some]<Value = unknown>(payload: SomeByHookPayload<Value>): Awaited<SomeByHookPayload<Value>>;
	public [Method.Some]<Value = unknown>(payload: SomePayload<Value>): Awaited<SomePayload<Value>> {
		return payload;
	}

	public [Method.Update]<Value = unknown>(payload: UpdateByDataPayload<Value>): Awaited<UpdateByDataPayload<Value>>;
	public [Method.Update]<Value = unknown>(payload: UpdateByHookPayload<Value>): Awaited<UpdateByHookPayload<Value>>;
	public [Method.Update]<Value = unknown>(payload: UpdatePayload<Value>): Awaited<UpdatePayload<Value>> {
		return payload;
	}

	public [Method.Values]<Value = unknown>(payload: ValuesPayload<Value>): Awaited<ValuesPayload<Value>> {
		return payload;
	}

	public run<P extends Payload>(payload: P): Awaited<unknown> {
		return payload;
	}

	public toJSON(): Record<string, any> {
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
