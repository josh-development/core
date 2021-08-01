import { getRootData } from '@sapphire/pieces';
import { classExtends, Constructor } from '@sapphire/utilities';
import { join } from 'path';
import type { AutoEnsureContext } from '../middlewares/CoreAutoEnsure';
import { BuiltInMiddleware, Method, Trigger } from '../types';
import { JoshError } from './JoshError';
import { JoshProvider, JoshProviderOptions } from './JoshProvider';
import { MapProvider } from './MapProvider';
import type { MiddlewareContext } from './Middleware';
import { MiddlewareStore } from './MiddlewareStore';
import type {
	EnsurePayload,
	GetAllPayload,
	GetManyPayload,
	GetPayload,
	HasPayload,
	KeysPayload,
	SetManyPayload,
	SetPayload,
	SizePayload,
	ValuesPayload
} from './payloads';

export class Josh<T = unknown> {
	public name: string;

	public options: JoshOptions<T>;

	public middlewares: MiddlewareStore;

	public provider: JoshProvider<T>;

	public constructor(options: JoshOptions<T>) {
		const { name, provider, middlewareDirectory } = options;

		this.options = options;

		if (!name) throw new JoshError('Name option not found.', 'JoshOptionsError');

		this.name = name;

		const Provider = provider ?? Josh.defaultProvider;

		if (!classExtends(Provider, JoshProvider as Constructor<JoshProvider<T>>)) throw new JoshError('Provider class must extend JoshProvider.');

		const initializedProvider = new Provider({ name, instance: this, options: options.providerOptions });

		this.provider = initializedProvider;
		this.middlewares = new MiddlewareStore({ instance: this })
			.registerPath(middlewareDirectory ?? join(getRootData().root, 'middlewares', this.name))
			.registerPath(join(__dirname, '..', 'middlewares'));
	}

	public async ensure<V = T>(key: string, defaultValue: V): Promise<V> {
		let payload: EnsurePayload<V> = { method: Method.Ensure, trigger: Trigger.PreProvider, key, data: defaultValue, defaultValue };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Ensure, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Ensure](payload);

		payload = await this.provider.ensure(payload);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Ensure, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Ensure](payload);

		return payload.data;
	}

	public async get<V = T>(keyPath: [string, string[]] | string): Promise<V | null> {
		const [key, path] = this.getKeyPath(keyPath);
		let payload: GetPayload<V> = { method: Method.Get, trigger: Trigger.PreProvider, key, path, data: null };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Get, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Get](payload);

		payload = await this.provider.get<V>(payload);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Get, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Get](payload);

		return payload.data;
	}

	public async getAll<V = T, K extends keyof ReturnBulk<V> = Bulk.Object>(returnBulkType?: K): Promise<ReturnBulk<V>[K]> {
		let payload: GetAllPayload<V> = { method: Method.GetAll, trigger: Trigger.PreProvider, data: {} };

		const preMiddlewares = this.middlewares.filterByCondition(Method.GetAll, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.GetAll](payload);

		payload = await this.provider.getAll<V>(payload);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition(Method.GetAll, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.GetAll](payload);

		return this.convertBulkData(payload.data, returnBulkType);
	}

	public async getMany<V = T, K extends keyof ReturnBulk<V> = Bulk.Object>(
		keyPaths: [string, string[]][],
		returnBulkType?: K
	): Promise<ReturnBulk<V>[K]> {
		let payload: GetManyPayload<V> = { method: Method.GetMany, trigger: Trigger.PreProvider, keyPaths, data: {} };

		const preMiddlewares = this.middlewares.filterByCondition(Method.GetMany, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.GetMany](payload);

		payload = await this.provider.getMany<V>(payload);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition(Method.GetMany, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.GetMany](payload);

		return this.convertBulkData(payload.data, returnBulkType);
	}

	public async has(keyPath: [string, string[]] | string): Promise<boolean> {
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

	public async set<V = T>(keyPath: [string, string[]] | string, value: V): Promise<this> {
		const [key, path] = this.getKeyPath(keyPath);
		let payload: SetPayload = { method: Method.Set, trigger: Trigger.PreProvider, key, path };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Set, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Set](payload);

		payload = await this.provider.set<V>(payload, value);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Set, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Set](payload);

		return this;
	}

	public async setMany<V = T>(keyPaths: [string, string[]][], value: V): Promise<this> {
		let payload: SetManyPayload = { method: Method.SetMany, trigger: Trigger.PreProvider, keyPaths };

		const preMiddlewares = this.middlewares.filterByCondition(Method.SetMany, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.SetMany](payload);

		payload = await this.provider.setMany<V>(payload, value);
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

	public async values<V = T>(): Promise<V[]> {
		let payload: ValuesPayload<V> = { method: Method.Values, trigger: Trigger.PreProvider, data: [] };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Values, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Values](payload);

		payload = await this.provider.values<V>(payload);
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

	protected convertBulkData<V = T, K extends keyof ReturnBulk<V> = Bulk.Object>(
		data: ReturnBulk<V>[Bulk.Object],
		returnBulkType?: K
	): ReturnBulk<V>[K] {
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

	protected getKeyPath(keyPath: string | [string, string[]]): [string, string[]] {
		if (typeof keyPath === 'string') {
			const [key, ...path] = keyPath.split('.');
			return [key, path];
		}

		return keyPath;
	}

	public static defaultProvider: Constructor<JoshProvider> = MapProvider;
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
