import { Piece, PieceContext, PieceOptions } from '@sapphire/pieces';
import type { Awaited } from '@sapphire/utilities';
import { Condition, Method } from '../types';
import { JoshError } from './JoshError';
import type { MiddlewareStore } from './MiddlewareStore';
import type {
	EnsurePayload,
	GetAllPayload,
	GetManyPayload,
	GetPayload,
	HasPayload,
	KeysPayload,
	SetPayload,
	SizePayload,
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

	public [Method.Ensure]<V = unknown>(payload: EnsurePayload<V>): Awaited<EnsurePayload<V>> {
		return payload;
	}

	public [Method.Get]<V = unknown>(payload: GetPayload<V>): Awaited<GetPayload<V>> {
		return payload;
	}

	public [Method.GetAll]<V = unknown>(payload: GetAllPayload<V>): Awaited<GetAllPayload<V>> {
		return payload;
	}

	public [Method.GetMany]<V = unknown>(payload: GetManyPayload<V>): Awaited<GetManyPayload<V>> {
		return payload;
	}

	public [Method.Has](payload: HasPayload): Awaited<HasPayload> {
		return payload;
	}

	public [Method.Keys](payload: KeysPayload): Awaited<KeysPayload> {
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

	public [Method.Values]<V = unknown>(payload: ValuesPayload<V>): Awaited<ValuesPayload<V>> {
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
