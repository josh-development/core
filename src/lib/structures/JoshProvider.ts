import type { Awaited } from '@sapphire/utilities';
import type { Josh } from './Josh';
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

export abstract class JoshProvider<T = unknown> {
	public name: string;

	public instance?: Josh<T>;

	public options: JoshProviderOptions;

	public constructor(context: JoshProviderContext<T>) {
		const { name, options, instance } = context;

		this.name = name ?? 'unknown';
		this.options = options ?? {};
		this.instance = instance;
	}

	public async init() {
		return Promise.resolve(true);
	}

	public abstract ensure<V = T>(payload: EnsurePayload<V>): Awaited<EnsurePayload<V>>;

	public abstract get<V = T>(payload: GetPayload<V>): Awaited<GetPayload<V>>;

	public abstract getAll<V = T>(payload: GetAllPayload<V>): Awaited<GetAllPayload<V>>;

	public abstract getMany<V = T>(payload: GetManyPayload<V>): Awaited<GetManyPayload<V>>;

	public abstract has(payload: HasPayload): Awaited<HasPayload>;

	public abstract keys(payload: KeysPayload): Awaited<KeysPayload>;

	public abstract set<V = T>(payload: SetPayload, value: V): Awaited<SetPayload>;

	public abstract size(payload: SizePayload): Awaited<SizePayload>;

	public abstract values<V = T>(payload: ValuesPayload<V>): Awaited<ValuesPayload<V>>;
}

export interface JoshProviderOptions {}

export interface JoshProviderContext<T = unknown> {
	name?: string;

	instance?: Josh<T>;

	options?: JoshProviderOptions;
}
