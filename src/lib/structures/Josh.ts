import { getRootData } from '@sapphire/pieces';
import { classExtends, Constructor } from '@sapphire/utilities';
import { join } from 'path';
import type { AutoEnsureDataOptions } from '../middlewares/CoreAutoEnsure';
import { Method, Trigger } from '../types';
import { BuiltInMiddleware } from '../types/BuiltInMiddleware';
import { JoshError } from './JoshError';
import { JoshProvider, JoshProviderOptions } from './JoshProvider';
import { MapProvider } from './MapProvider';
import { MiddlewareStore } from './MiddlewareStore';
import type { GetAllPayload, GetPayload, SetPayload } from './payloads';
import type { EnsurePayload } from './payloads/Ensure';
import type { HasPayload } from './payloads/Has';

export class Josh<T = unknown> {
	public name: string;

	public options: JoshOptions<T>;

	private middlewares: MiddlewareStore;

	private provider: JoshProvider<T>;

	public constructor(options: JoshOptions<T>) {
		const { name, provider, middlewareDirectory } = options;

		this.options = options;

		if (!name) throw new JoshError('Name option not found.', 'JoshOptionsError');

		const Provider = provider ?? Josh.defaultProvider;

		if (!classExtends(Provider, JoshProvider as Constructor<JoshProvider<T>>)) throw new JoshError('Provider class must extend JoshProvider.');

		const initializedProvider = new Provider({ name, instance: this, options: options.providerOptions });

		this.provider = initializedProvider;
		this.name = name;
		this.middlewares = new MiddlewareStore({ instance: this, provider: initializedProvider })
			.registerPath(middlewareDirectory ?? join(getRootData().root, 'middlewares', this.name))
			.registerPath(join(__dirname, '..', 'middlewares'));
	}

	public async ensure<V = T>(key: string, defaultValue: V): Promise<V> {
		let payload: EnsurePayload<V> = { method: Method.Ensure, trigger: Trigger.PreProvider, key, data: defaultValue, defaultValue };

		const preMiddlewares = this.middlewares.filterByCondition({ methods: [Method.Ensure], trigger: Trigger.PreProvider });
		for (const middleware of preMiddlewares) payload = await middleware[Method.Ensure](payload);

		payload = await this.provider.ensure(payload);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition({ methods: [Method.Ensure] });
		for (const middleware of postMiddlewares) payload = await middleware[Method.Ensure](payload);

		return payload.data;
	}

	public async get<V = T>(keyOrPath: string): Promise<V | null> {
		const [key, path] = this.getKeyAndPath(keyOrPath);
		let payload: GetPayload<V> = { method: Method.Get, trigger: Trigger.PreProvider, key, path, data: null };

		const preMiddlewares = this.middlewares.filterByCondition({ methods: [Method.Get], trigger: Trigger.PreProvider });
		for (const middleware of preMiddlewares) payload = await middleware[Method.Get](payload);

		payload = await this.provider.get<V>(payload);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition({ methods: [Method.Get] });
		for (const middleware of postMiddlewares) payload = await middleware[Method.Get](payload);

		return payload.data;
	}

	public async getAll<V = T, K extends keyof ReturnBulk<V> = Bulk.Object>(returnBulkType?: K): Promise<ReturnBulk<V>[K]> {
		let payload: GetAllPayload<V> = { method: Method.GetAll, trigger: Trigger.PreProvider, data: {} };

		const preMiddlewares = this.middlewares.filterByCondition({ methods: [Method.GetAll], trigger: Trigger.PreProvider });
		for (const middleware of preMiddlewares) payload = await middleware[Method.GetAll](payload);

		payload = await this.provider.getAll<V>(payload);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition({ methods: [Method.GetAll] });
		for (const middleware of postMiddlewares) payload = await middleware[Method.GetAll](payload);

		return this.convertBulkData(payload.data, returnBulkType);
	}

	public async has(keyOrPath: string): Promise<boolean> {
		const [key, path] = this.getKeyAndPath(keyOrPath);
		let payload: HasPayload = { method: Method.Has, trigger: Trigger.PreProvider, key, path, data: false };

		const preMiddlewares = this.middlewares.filterByCondition({ methods: [Method.Has], trigger: Trigger.PreProvider });
		for (const middleware of preMiddlewares) payload = await middleware[Method.Has](payload);

		payload = await this.provider.has(payload);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition({ methods: [Method.Has] });
		for (const middleware of postMiddlewares) payload = await middleware[Method.Has](payload);

		return payload.data;
	}

	public async set<V = T>(keyOrPath: string, value: V): Promise<this> {
		const [key, path] = this.getKeyAndPath(keyOrPath);
		let payload: SetPayload = { method: Method.Set, trigger: Trigger.PreProvider, key, path };

		const preMiddlewares = this.middlewares.filterByCondition({ methods: [Method.Set], trigger: Trigger.PreProvider });
		for (const middleware of preMiddlewares) payload = await middleware[Method.Set](payload);

		payload = await this.provider.set<V>(payload, value);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition({ methods: [Method.Set] });
		for (const middleware of postMiddlewares) payload = await middleware[Method.Set](payload);

		return this;
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

	protected getKeyAndPath(keyOrPath: string): [string, string] {
		const [key, ...path] = keyOrPath.split('.');
		return [key, path.join('.')];
	}

	public static defaultProvider: Constructor<JoshProvider> = MapProvider;
}

export interface JoshOptions<T = unknown> {
	name?: string;

	provider?: Constructor<JoshProvider<T>>;

	providerOptions?: JoshProviderOptions;

	middlewareDirectory?: string;

	middlewareOptions?: MiddlewareDataOptions<T>;
}

export enum Bulk {
	Object,

	Map,

	OneDimensionalArray,

	TwoDimensionalArray
}

export interface ReturnBulk<T = unknown> {
	[Bulk.Object]: Record<string, T>;

	[Bulk.Map]: Map<string, T>;

	[Bulk.OneDimensionalArray]: T[];

	[Bulk.TwoDimensionalArray]: [string, T][];

	[K: string]: Record<string, T> | Map<string, T> | T[] | [string, T][];
}

export interface MiddlewareDataOptions<T = unknown> {
	[BuiltInMiddleware.AutoEnsure]?: AutoEnsureDataOptions<T>;
}
