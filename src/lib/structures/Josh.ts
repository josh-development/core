import { getRootData } from '@sapphire/pieces';
import { classExtends, Constructor } from '@sapphire/utilities';
import { join } from 'path';
import type { AutoEnsureContext } from '../middlewares/CoreAutoEnsure';
import { BuiltInMiddleware, KeyPath, KeyPathArray, Method, Trigger } from '../types';
import { JoshError } from './JoshError';
import { JoshProvider, JoshProviderOptions } from './JoshProvider';
import { MapProvider } from './MapProvider';
import type { MiddlewareContext } from './Middleware';
import { MiddlewareStore } from './MiddlewareStore';
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
	UpdateHook,
	UpdatePayload,
	ValuesPayload
} from './payloads';

export class Josh<Value = unknown> {
	public name: string;

	public options: JoshOptions<Value>;

	public middlewares: MiddlewareStore;

	public provider: JoshProvider<Value>;

	public constructor(options: JoshOptions<Value>) {
		const { name, provider, middlewareDirectory } = options;

		this.options = options;

		if (!name) throw new JoshError('Name option not found.', 'JoshOptionsError');

		this.name = name;

		const Provider = provider ?? Josh.defaultProvider;

		if (!classExtends(Provider, JoshProvider as Constructor<JoshProvider<Value>>)) throw new JoshError('Provider class must extend JoshProvider.');

		const initializedProvider = new Provider({ name, instance: this, options: options.providerOptions });

		this.provider = initializedProvider;
		this.middlewares = new MiddlewareStore({ instance: this })
			.registerPath(middlewareDirectory ?? join(getRootData().root, 'middlewares', this.name))
			.registerPath(join(__dirname, '..', 'middlewares'));
	}

	public async autoKey(): Promise<string> {
		let payload: AutoKeyPayload = { method: Method.AutoKey, trigger: Trigger.PreProvider, data: '' };

		const preMiddlewares = this.middlewares.filterByCondition(Method.AutoKey, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.AutoKey](payload);

		payload = await this.provider.autoKey(payload);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition(Method.AutoKey, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.AutoKey](payload);

		return payload.data;
	}

	public async ensure<CustomValue = Value>(key: string, defaultValue: CustomValue): Promise<CustomValue> {
		let payload: EnsurePayload<CustomValue> = { method: Method.Ensure, trigger: Trigger.PreProvider, key, data: defaultValue, defaultValue };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Ensure, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Ensure](payload);

		payload = await this.provider.ensure(payload);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Ensure, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Ensure](payload);

		return payload.data;
	}

	public async get<CustomValue = Value>(keyPath: KeyPath): Promise<CustomValue | null> {
		const [key, path] = this.getKeyPath(keyPath);
		let payload: GetPayload<CustomValue> = { method: Method.Get, trigger: Trigger.PreProvider, key, path };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Get, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Get](payload);

		payload = await this.provider.get(payload);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Get, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Get](payload);

		return payload.data ?? null;
	}

	public async getAll<CustomValue = Value, K extends keyof ReturnBulk<CustomValue> = Bulk.Object>(
		returnBulkType?: K
	): Promise<ReturnBulk<CustomValue>[K]> {
		let payload: GetAllPayload<CustomValue> = { method: Method.GetAll, trigger: Trigger.PreProvider, data: {} };

		const preMiddlewares = this.middlewares.filterByCondition(Method.GetAll, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.GetAll](payload);

		payload = await this.provider.getAll(payload);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition(Method.GetAll, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.GetAll](payload);

		return this.convertBulkData(payload.data, returnBulkType);
	}

	public async getMany<CustomValue = Value, K extends keyof ReturnBulk<CustomValue> = Bulk.Object>(
		keyPaths: KeyPathArray[],
		returnBulkType?: K
	): Promise<ReturnBulk<CustomValue>[K]> {
		let payload: GetManyPayload<CustomValue> = { method: Method.GetMany, trigger: Trigger.PreProvider, keyPaths, data: {} };

		const preMiddlewares = this.middlewares.filterByCondition(Method.GetMany, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.GetMany](payload);

		payload = await this.provider.getMany(payload);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition(Method.GetMany, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.GetMany](payload);

		return this.convertBulkData(payload.data, returnBulkType);
	}

	public async has(keyPath: KeyPath): Promise<boolean> {
		const [key, path] = this.getKeyPath(keyPath);
		let payload: HasPayload = { method: Method.Has, trigger: Trigger.PreProvider, key, path, data: false };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Has, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Has](payload);

		payload = await this.provider.has(payload);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Has, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Has](payload);

		return payload.data;
	}

	public async keys(): Promise<string[]> {
		let payload: KeysPayload = { method: Method.Keys, trigger: Trigger.PreProvider, data: [] };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Keys, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Keys](payload);

		payload = await this.provider.keys(payload);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Keys, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Keys](payload);

		return payload.data;
	}

	public async random<CustomValue = Value>(): Promise<CustomValue | null> {
		let payload: RandomPayload<CustomValue> = { method: Method.Random, trigger: Trigger.PreProvider };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Random, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Random](payload);

		payload = await this.provider.random(payload);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Random, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Random](payload);

		return payload.data ?? null;
	}

	public async randomKey(): Promise<string | null> {
		let payload: RandomKeyPayload = { method: Method.RandomKey, trigger: Trigger.PreProvider };

		const preMiddlewares = this.middlewares.filterByCondition(Method.RandomKey, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.RandomKey](payload);

		payload = await this.provider.randomKey(payload);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition(Method.RandomKey, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.RandomKey](payload);

		return payload.data ?? null;
	}

	public async set<CustomValue = Value>(keyPath: KeyPathArray, value: CustomValue): Promise<this> {
		const [key, path] = this.getKeyPath(keyPath);
		let payload: SetPayload = { method: Method.Set, trigger: Trigger.PreProvider, key, path };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Set, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Set](payload);

		payload = await this.provider.set(payload, value);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Set, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Set](payload);

		return this;
	}

	public async setMany<CustomValue = Value>(keyPaths: [string, string[]][], value: CustomValue): Promise<this> {
		let payload: SetManyPayload = { method: Method.SetMany, trigger: Trigger.PreProvider, keyPaths };

		const preMiddlewares = this.middlewares.filterByCondition(Method.SetMany, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.SetMany](payload);

		payload = await this.provider.setMany(payload, value);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition(Method.SetMany, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.SetMany](payload);

		return this;
	}

	public async size(): Promise<number> {
		let payload: SizePayload = { method: Method.Size, trigger: Trigger.PreProvider, data: 0 };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Size, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Size](payload);

		payload = await this.provider.size(payload);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Size, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Size](payload);

		return payload.data;
	}

	public async update<CustomValue = Value>(
		keyPath: KeyPathArray,
		inputDataOrHook: CustomValue | UpdateHook<CustomValue>
	): Promise<CustomValue | null> {
		const [key, path] = this.getKeyPath(keyPath);
		let payload: UpdatePayload<CustomValue> = { method: Method.Update, trigger: Trigger.PreProvider, key, path };

		if (typeof inputDataOrHook === 'function') Reflect.set(payload, 'inputHook', inputDataOrHook);
		else Reflect.set(payload, 'inputData', inputDataOrHook);

		const preMiddlewares = this.middlewares.filterByCondition(Method.Update, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Update](payload);

		payload = await this.provider[typeof inputDataOrHook === 'function' ? 'updateByHook' : 'updateByData'](payload);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Update, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Update](payload);

		return payload.data ?? null;
	}

	public async values<CustomValue = Value>(): Promise<CustomValue[]> {
		let payload: ValuesPayload<CustomValue> = { method: Method.Values, trigger: Trigger.PreProvider, data: [] };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Values, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Values](payload);

		payload = await this.provider.values(payload);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Values, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Values](payload);

		return payload.data;
	}

	public async init(): Promise<this> {
		await this.middlewares.loadAll();

		const success = await this.provider.init();

		if (!success) throw new JoshError('Initiating provider was unsuccessful.');

		return this;
	}

	public use(name: BuiltInMiddleware): this;
	public use(name: string): this {
		const middleware = this.middlewares.get(name);

		if (!middleware) throw new JoshError('This middleware was not found to enable.');

		middleware.use = true;

		this.middlewares.set(name, middleware);

		return this;
	}

	protected convertBulkData<CustomValue = Value, K extends keyof ReturnBulk<CustomValue> = Bulk.Object>(
		data: ReturnBulk<CustomValue>[Bulk.Object],
		returnBulkType?: K
	): ReturnBulk<CustomValue>[K] {
		switch (returnBulkType) {
			case Bulk.Object:
				return data;

			case Bulk.Map:
				return new Map(Object.entries(data));

			case Bulk.OneDimensionalArray:
				return Object.values(data);

			case Bulk.TwoDimensionalArray:
				return Object.entries(data);

			default:
				return data;
		}
	}

	protected getKeyPath(keyPath: KeyPath): [string, string[] | undefined] {
		if (typeof keyPath === 'string') return [keyPath, undefined];

		return keyPath;
	}

	public static defaultProvider: Constructor<JoshProvider> = MapProvider;

	public static multi<Instances extends Record<string, Josh> = Record<string, Josh>>(
		names: string[],
		options: Omit<JoshOptions, 'name'> = {}
	): Instances {
		const instances: Record<string, Josh> = {};

		for (const [name, instance] of names.map((name) => [name, new Josh({ ...options, name })]) as [string, Josh][]) instances[name] = instance;

		// @ts-expect-error 2322
		return instances;
	}
}

export interface JoshOptions<T = unknown> {
	name?: string;

	provider?: Constructor<JoshProvider<T>>;

	providerOptions?: JoshProviderOptions;

	middlewareDirectory?: string;

	middlewareContextData?: MiddlewareContextData<T>;
}

export enum Bulk {
	Object,

	Map,

	OneDimensionalArray,

	TwoDimensionalArray
}

export interface ReturnBulk<T = unknown> {
	[Bulk.Object]: Record<string, T | null>;

	[Bulk.Map]: Map<string, T | null>;

	[Bulk.OneDimensionalArray]: (T | null)[];

	[Bulk.TwoDimensionalArray]: [string, T | null][];

	[K: string]: Record<string, T | null> | Map<string, T | null> | (T | null)[] | [string, T | null][];
}

export interface MiddlewareContextData<T = unknown> {
	[BuiltInMiddleware.AutoEnsure]?: AutoEnsureContext<T>;

	[K: string]: MiddlewareContext | undefined;
}
