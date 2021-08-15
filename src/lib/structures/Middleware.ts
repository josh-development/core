import { Piece, PieceContext, PieceOptions } from '@sapphire/pieces';
import type { Awaited } from '@sapphire/utilities';
import { Method, Trigger } from '../types';
import { JoshError } from './JoshError';
import type { MiddlewareStore } from './MiddlewareStore';
import type {
	AutoKeyPayload,
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
	KeysPayload,
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
} from './payloads';

export abstract class Middleware<Context extends MiddlewareContext = MiddlewareContext> extends Piece {
	public declare store: MiddlewareStore;

	public readonly position?: number;

	public readonly conditions: Condition[];

	public use: boolean;

	public constructor(context: PieceContext, options: MiddlewareOptions = {}) {
		super(context, options);

		const { position, conditions, use } = options;

		if (!conditions) throw new JoshError('Missing condition option.', 'JoshMiddlewareError');

		this.position = position;
		this.conditions = conditions;
		this.use = use ?? true;
	}

	public [Method.AutoKey](payload: AutoKeyPayload): Awaited<AutoKeyPayload> {
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

	public [Method.Keys](payload: KeysPayload): Awaited<KeysPayload> {
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

	public toJSON(): Record<string, any> {
		return { ...super.toJSON(), position: this.position, conditions: this.conditions, use: this.use };
	}

	protected getContext<C extends MiddlewareContext = Context>(): C | undefined {
		const contextData = this.instance.options.middlewareContextData ?? {};

		return Reflect.get(contextData, this.name);
	}

	protected get instance() {
		return this.store.instance;
	}

	protected get provider() {
		return this.instance.provider;
	}
}

export interface MiddlewareOptions extends PieceOptions {
	position?: number;

	conditions?: Condition[];

	use?: boolean;
}

export interface MiddlewareContext {}

export interface Condition {
	methods: Method[];

	trigger: Trigger;
}
