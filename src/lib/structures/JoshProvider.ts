import type { Awaited } from '@sapphire/utilities';
import type { Josh } from './Josh';
import type {
	AutoKeyPayload,
	EnsurePayload,
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
	UpdateByDataPayload,
	UpdateByHookPayload,
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

	public abstract autoKey(payload: AutoKeyPayload): Awaited<AutoKeyPayload>;

	public abstract ensure<V = T>(payload: EnsurePayload<V>): Awaited<EnsurePayload<V>>;

	public abstract get<V = T>(payload: GetPayload<V>): Awaited<GetPayload<V>>;

	public abstract getAll<V = T>(payload: GetAllPayload<V>): Awaited<GetAllPayload<V>>;

	public abstract getMany<V = T>(payload: GetManyPayload<V>): Awaited<GetManyPayload<V>>;

	public abstract has(payload: HasPayload): Awaited<HasPayload>;

	public abstract keys(payload: KeysPayload): Awaited<KeysPayload>;

	public abstract random<V = T>(payload: RandomPayload<V>): Awaited<RandomPayload<V>>;

	public abstract randomKey(payload: RandomKeyPayload): Awaited<RandomKeyPayload>;

	public abstract set<V = T>(payload: SetPayload, value: V): Awaited<SetPayload>;

	public abstract setMany<V = T>(payload: SetManyPayload, value: V): Awaited<SetManyPayload>;

	public abstract size(payload: SizePayload): Awaited<SizePayload>;

	public abstract updateByData<V = T>(payload: UpdateByDataPayload<V>): Awaited<UpdateByDataPayload<V>>;

	public abstract updateByHook<V = T>(payload: UpdateByHookPayload<V>): Awaited<UpdateByHookPayload<V>>;

	public abstract values<V = T>(payload: ValuesPayload<V>): Awaited<ValuesPayload<V>>;
}

export interface JoshProviderOptions {}

export interface JoshProviderContext<T = unknown> {
	name?: string;

	instance?: Josh<T>;

	options?: JoshProviderOptions;
}
