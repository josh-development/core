import { Piece, PieceContext, PieceOptions } from '@sapphire/pieces';
import type { Awaited } from '@sapphire/utilities';
import { Condition, Method } from '../types';
import { JoshError } from './JoshError';
import type { MiddlewareStore } from './MiddlewareStore';
import type {
	AutoKeyPayload,
	EnsurePayload,
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
	SetPayload,
	SizePayload,
	UpdatePayload,
	ValuesPayload
} from './payloads';
import type { SetManyPayload } from './payloads/SetMany';

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

	public [Method.Ensure]<Value = unknown>(payload: EnsurePayload<Value>): Awaited<EnsurePayload<Value>> {
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

	public [Method.Update]<Value = unknown>(payload: UpdatePayload<Value>): Awaited<UpdatePayload<Value>> {
		return payload;
	}

	public [Method.Values]<Value = unknown>(payload: ValuesPayload<Value>): Awaited<ValuesPayload<Value>> {
		return payload;
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
