import type { Awaited } from '@sapphire/utilities';
import type { Josh } from './Josh';
import type {
	AutoKeyPayload,
	EnsurePayload,
	FindByDataPayload,
	FindByHookPayload,
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

export abstract class JoshProvider<Value = unknown> {
	public name: string;

	public instance?: Josh<Value>;

	public options: JoshProviderOptions;

	public constructor(context: JoshProviderContext<Value>) {
		const { name, options, instance } = context;

		this.name = name ?? 'unknown';
		this.options = options ?? {};
		this.instance = instance;
	}

	public async init() {
		return Promise.resolve(true);
	}

	public abstract autoKey(payload: AutoKeyPayload): Awaited<AutoKeyPayload>;

	public abstract ensure<CustomValue = Value>(payload: EnsurePayload<CustomValue>): Awaited<EnsurePayload<CustomValue>>;

	public abstract findByData<CustomValue = Value>(payload: FindByDataPayload<CustomValue>): Awaited<FindByDataPayload<CustomValue>>;

	public abstract findByHook<CustomValue = Value>(payload: FindByHookPayload<CustomValue>): Awaited<FindByHookPayload<CustomValue>>;

	public abstract get<CustomValue = Value>(payload: GetPayload<CustomValue>): Awaited<GetPayload<CustomValue>>;

	public abstract getAll<CustomValue = Value>(payload: GetAllPayload<CustomValue>): Awaited<GetAllPayload<CustomValue>>;

	public abstract getMany<CustomValue = Value>(payload: GetManyPayload<CustomValue>): Awaited<GetManyPayload<CustomValue>>;

	public abstract has(payload: HasPayload): Awaited<HasPayload>;

	public abstract keys(payload: KeysPayload): Awaited<KeysPayload>;

	public abstract random<CustomValue = Value>(payload: RandomPayload<CustomValue>): Awaited<RandomPayload<CustomValue>>;

	public abstract randomKey(payload: RandomKeyPayload): Awaited<RandomKeyPayload>;

	public abstract set<CustomValue = Value>(payload: SetPayload, value: CustomValue): Awaited<SetPayload>;

	public abstract setMany<CustomValue = Value>(payload: SetManyPayload, value: CustomValue): Awaited<SetManyPayload>;

	public abstract size(payload: SizePayload): Awaited<SizePayload>;

	public abstract updateByData<CustomValue = Value>(payload: UpdateByDataPayload<CustomValue>): Awaited<UpdateByDataPayload<CustomValue>>;

	public abstract updateByHook<CustomValue = Value>(payload: UpdateByHookPayload<CustomValue>): Awaited<UpdateByHookPayload<CustomValue>>;

	public abstract values<CustomValue = Value>(payload: ValuesPayload<CustomValue>): Awaited<ValuesPayload<CustomValue>>;
}

export interface JoshProviderOptions {}

export interface JoshProviderContext<Value = unknown> {
	name?: string;

	instance?: Josh<Value>;

	options?: JoshProviderOptions;
}