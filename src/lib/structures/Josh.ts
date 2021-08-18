import { getRootData } from '@sapphire/pieces';
import { isFunction } from '@sapphire/utilities';
import { join } from 'path';
import type { AutoEnsureContext } from '../../middlewares/CoreAutoEnsure';
import { JoshError } from '../errors';
import {
	AutoKeyPayload,
	DecPayload,
	DeletePayload,
	EnsurePayload,
	FilterByDataPayload,
	FilterByHookPayload,
	FilterHook,
	FindByDataPayload,
	FindByHookPayload,
	FindHook,
	GetAllPayload,
	GetManyPayload,
	GetPayload,
	HasPayload,
	IncPayload,
	KeysPayload,
	Payload,
	PushPayload,
	RandomKeyPayload,
	RandomPayload,
	SetManyPayload,
	SetPayload,
	SizePayload,
	SomeByDataPayload,
	SomeByHookPayload,
	SomeHook,
	UpdateByDataPayload,
	UpdateByHookPayload,
	UpdateHook,
	ValuesPayload
} from '../payloads';
import { BuiltInMiddleware, KeyPath, KeyPathArray, Method, Trigger } from '../types';
import { MapProvider } from './defaultProvider';
import { JoshProvider } from './JoshProvider';
import type { Middleware } from './Middleware';
import { MiddlewareStore } from './MiddlewareStore';

export class Josh<Value = unknown> {
	public name: string;

	public options: Josh.Options<Value>;

	public middlewares: MiddlewareStore;

	public provider: JoshProvider<Value>;

	public constructor(options: Josh.Options<Value>) {
		const { name, provider, middlewareDirectory } = options;

		this.options = options;

		if (!name)
			throw new JoshError({ identifier: Josh.Identifiers.MissingName, message: 'The "name" option is required to initiate a Josh instance.' });

		this.name = name;
		this.provider = provider ?? new MapProvider<Value>();

		if (!(this.provider instanceof JoshProvider))
			throw new JoshError({
				identifier: Josh.Identifiers.InvalidProvider,
				message: 'The "provider" option must extend the exported "JoshProvider" class.'
			});

		this.middlewares = new MiddlewareStore({ instance: this })
			.registerPath(middlewareDirectory ?? join(getRootData().root, 'middlewares', this.name))
			.registerPath(join(__dirname, '..', '..', 'middlewares'));
	}

	public async autoKey(): Promise<string> {
		let payload: AutoKeyPayload = { method: Method.AutoKey, trigger: Trigger.PreProvider, data: '' };

		const preMiddlewares = this.middlewares.filterByCondition(Method.AutoKey, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.AutoKey](payload);

		payload = await this.provider.autoKey(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		const postMiddlewares = this.middlewares.filterByCondition(Method.AutoKey, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.AutoKey](payload);

		return payload.data;
	}

	public async dec(keyPath: KeyPath): Promise<this> {
		const [key, path] = this.getKeyPath(keyPath);
		let payload: DecPayload = { method: Method.Dec, trigger: Trigger.PreProvider, key, path };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Dec, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Dec](payload);

		payload = await this.provider.dec(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Dec, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Dec](payload);

		return this;
	}

	public async delete(keyPath: KeyPath): Promise<this> {
		const [key, path] = this.getKeyPath(keyPath);
		let payload: DeletePayload = { method: Method.Delete, trigger: Trigger.PreProvider, key, path };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Delete, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Delete](payload);

		payload = await this.provider.delete(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Delete, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Delete](payload);

		return this;
	}

	public async ensure<CustomValue = Value>(key: string, defaultValue: CustomValue): Promise<CustomValue> {
		let payload: EnsurePayload<CustomValue> = { method: Method.Ensure, trigger: Trigger.PreProvider, key, data: defaultValue, defaultValue };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Ensure, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Ensure](payload);

		payload = await this.provider.ensure(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Ensure, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Ensure](payload);

		return payload.data;
	}

	public async filter<CustomValue = Value, K extends keyof ReturnBulk<CustomValue> = Bulk.Object>(
		path: string[],
		value: CustomValue,
		returnBulkType?: K
	): Promise<ReturnBulk<CustomValue>[K]>;

	public async filter<CustomValue = Value, K extends keyof ReturnBulk<CustomValue> = Bulk.Object>(
		hook: FilterHook<CustomValue>,
		path?: string[],
		returnBulkType?: K
	): Promise<ReturnBulk<CustomValue>[K]>;

	public async filter<CustomValue = Value, K extends keyof ReturnBulk<CustomValue> = Bulk.Object>(
		pathOrHook: string[] | FilterHook<CustomValue>,
		pathOrValue?: string[] | CustomValue,
		returnBulkType?: K
	): Promise<ReturnBulk<CustomValue>[K]> {
		if (Array.isArray(pathOrHook)) {
			if (pathOrValue === undefined)
				throw new JoshError({
					identifier: Josh.Identifiers.FilterMissingValue,
					message: 'The "value" parameter is required when filtering by data.'
				});

			let payload: FilterByDataPayload<CustomValue> = {
				method: Method.Filter,
				trigger: Trigger.PreProvider,
				type: Payload.Type.Data,
				path: pathOrHook,
				inputData: pathOrValue as CustomValue,
				data: {}
			};

			const preMiddlewares = this.middlewares.filterByCondition(Method.Filter, Trigger.PreProvider);
			for (const middleware of preMiddlewares) payload = await middleware[Method.Filter](payload);

			payload = await this.provider.filterByData(payload);
			payload.trigger = Trigger.PostProvider;

			if (payload.error) throw payload.error;

			const postMiddlewares = this.middlewares.filterByCondition(Method.Filter, Trigger.PostProvider);
			for (const middleware of postMiddlewares) payload = await middleware[Method.Filter](payload);

			return this.convertBulkData(payload.data, returnBulkType);
		}

		if (pathOrValue !== undefined && !Array.isArray(pathOrValue))
			throw new JoshError({ identifier: Josh.Identifiers.FilterInvalidPath, message: 'The "path" parameter must be an array of strings.' });

		let payload: FilterByHookPayload<CustomValue> = {
			method: Method.Filter,
			trigger: Trigger.PreProvider,
			type: Payload.Type.Hook,
			path: pathOrValue as string[] | undefined,
			inputHook: pathOrHook,
			data: {}
		};

		const preMiddlewares = this.middlewares.filterByCondition(Method.Filter, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Filter](payload);

		payload = await this.provider.filterByHook(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Filter, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Filter](payload);

		return this.convertBulkData(payload.data, returnBulkType);
	}

	public async find<CustomValue = Value>(path: string[], value: CustomValue): Promise<CustomValue>;
	public async find<CustomValue = Value>(hook: FindHook<CustomValue>, path?: string[]): Promise<CustomValue | null>;
	public async find<CustomValue = Value>(
		pathOrHook: string[] | FindHook<CustomValue>,
		pathOrValue?: string[] | CustomValue
	): Promise<CustomValue | null> {
		if (Array.isArray(pathOrHook)) {
			if (pathOrValue === undefined)
				throw new JoshError({ identifier: Josh.Identifiers.FindMissingValue, message: 'The "value" parameter is required when finding by data.' });

			let payload: FindByDataPayload<CustomValue> = {
				method: Method.Find,
				trigger: Trigger.PreProvider,
				type: Payload.Type.Data,
				path: pathOrHook,
				inputData: pathOrValue as CustomValue
			};

			const preMiddlewares = this.middlewares.filterByCondition(Method.Find, Trigger.PreProvider);
			for (const middleware of preMiddlewares) payload = await middleware[Method.Find](payload);

			payload = await this.provider.findByData(payload);
			payload.trigger = Trigger.PostProvider;

			if (payload.error) throw payload.error;

			const postMiddlewares = this.middlewares.filterByCondition(Method.Find, Trigger.PostProvider);
			for (const middleware of postMiddlewares) payload = await middleware[Method.Find](payload);

			return payload.data ?? null;
		}

		if (pathOrValue !== undefined && !Array.isArray(pathOrValue))
			throw new JoshError({ identifier: Josh.Identifiers.FindInvalidPath, message: 'The "path" parameter must be an array of strings.' });

		let payload: FindByHookPayload<CustomValue> = {
			method: Method.Find,
			trigger: Trigger.PreProvider,
			type: Payload.Type.Hook,
			path: pathOrValue as string[] | undefined,
			inputHook: pathOrHook
		};

		const preMiddlewares = this.middlewares.filterByCondition(Method.Find, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Find](payload);

		payload = await this.provider.findByHook(payload);
		payload.trigger = Trigger.PostProvider;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Find, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Find](payload);

		return payload.data ?? null;
	}

	public async get<CustomValue = Value>(keyPath: KeyPath): Promise<CustomValue | null> {
		const [key, path] = this.getKeyPath(keyPath);
		let payload: GetPayload<CustomValue> = { method: Method.Get, trigger: Trigger.PreProvider, key, path };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Get, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Get](payload);

		payload = await this.provider.get(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

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

		if (payload.error) throw payload.error;

		const postMiddlewares = this.middlewares.filterByCondition(Method.GetAll, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.GetAll](payload);

		return this.convertBulkData(payload.data, returnBulkType);
	}

	public async getMany<CustomValue = Value, K extends keyof ReturnBulk<CustomValue> = Bulk.Object>(
		keyPaths: KeyPathArray[],
		returnBulkType?: K
	): Promise<ReturnBulk<CustomValue | null>[K]> {
		let payload: GetManyPayload<CustomValue> = { method: Method.GetMany, trigger: Trigger.PreProvider, keyPaths, data: {} };

		const preMiddlewares = this.middlewares.filterByCondition(Method.GetMany, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.GetMany](payload);

		payload = await this.provider.getMany(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

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

		if (payload.error) throw payload.error;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Has, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Has](payload);

		return payload.data;
	}

	public async inc(keyPath: KeyPath): Promise<this> {
		const [key, path] = this.getKeyPath(keyPath);
		let payload: IncPayload = { method: Method.Inc, trigger: Trigger.PreProvider, key, path };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Inc, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Inc](payload);

		payload = await this.provider.inc(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Inc, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Inc](payload);

		return this;
	}

	public async keys(): Promise<string[]> {
		let payload: KeysPayload = { method: Method.Keys, trigger: Trigger.PreProvider, data: [] };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Keys, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Keys](payload);

		payload = await this.provider.keys(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Keys, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Keys](payload);

		return payload.data;
	}

	public async push<CustomValue = Value>(keyPath: KeyPath, value: CustomValue): Promise<this> {
		const [key, path] = this.getKeyPath(keyPath);
		let payload: PushPayload = { method: Method.Push, trigger: Trigger.PreProvider, key, path };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Push, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Push](payload);

		payload = await this.provider.push(payload, value);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Push, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Push](payload);

		return this;
	}

	public async random<CustomValue = Value>(): Promise<CustomValue | null> {
		let payload: RandomPayload<CustomValue> = { method: Method.Random, trigger: Trigger.PreProvider };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Random, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Random](payload);

		payload = await this.provider.random(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

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

		if (payload.error) throw payload.error;

		const postMiddlewares = this.middlewares.filterByCondition(Method.RandomKey, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.RandomKey](payload);

		return payload.data ?? null;
	}

	public async set<CustomValue = Value>(keyPath: KeyPath, value: CustomValue): Promise<this> {
		const [key, path] = this.getKeyPath(keyPath);
		let payload: SetPayload = { method: Method.Set, trigger: Trigger.PreProvider, key, path };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Set, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Set](payload);

		payload = await this.provider.set(payload, value);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

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

		if (payload.error) throw payload.error;

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

		if (payload.error) throw payload.error;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Size, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Size](payload);

		return payload.data;
	}

	public async some<CustomValue = Value>(path: string[], value: CustomValue): Promise<boolean>;
	public async some<CustomValue = Value>(hook: SomeHook<CustomValue>, path?: string[]): Promise<boolean>;
	public async some<CustomValue = Value>(pathOrHook: string[] | SomeHook<CustomValue>, pathOrValue?: string[] | CustomValue): Promise<boolean> {
		if (Array.isArray(pathOrHook)) {
			if (pathOrValue === undefined)
				throw new JoshError({ identifier: Josh.Identifiers.SomeMissingValue, message: 'The "value" parameter is required when finding by data.' });

			let payload: SomeByDataPayload<CustomValue> = {
				method: Method.Some,
				trigger: Trigger.PreProvider,
				type: Payload.Type.Data,
				path: pathOrHook,
				inputData: pathOrValue as CustomValue,
				data: false
			};

			const preMiddlewares = this.middlewares.filterByCondition(Method.Some, Trigger.PreProvider);
			for (const middleware of preMiddlewares) payload = await middleware[Method.Some](payload);

			payload = await this.provider.someByData(payload);
			payload.trigger = Trigger.PostProvider;

			if (payload.error) throw payload.error;

			const postMiddlewares = this.middlewares.filterByCondition(Method.Some, Trigger.PostProvider);
			for (const middleware of postMiddlewares) payload = await middleware[Method.Some](payload);

			return payload.data;
		}

		if (pathOrValue !== undefined && !Array.isArray(pathOrValue))
			throw new JoshError({ identifier: Josh.Identifiers.SomeInvalidPath, message: 'The "path" parameter must be an array of strings.' });

		let payload: SomeByHookPayload<CustomValue> = {
			method: Method.Some,
			trigger: Trigger.PreProvider,
			type: Payload.Type.Hook,
			path: pathOrValue as string[] | undefined,
			inputHook: pathOrHook,
			data: false
		};

		const preMiddlewares = this.middlewares.filterByCondition(Method.Some, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Some](payload);

		payload = await this.provider.someByHook(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Some, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Some](payload);

		return payload.data;
	}

	public async update<CustomValue = Value>(keyPath: KeyPath, inputDataOrHook: CustomValue | UpdateHook<CustomValue>): Promise<CustomValue | null> {
		const [key, path] = this.getKeyPath(keyPath);

		if (isFunction(inputDataOrHook)) {
			let payload: UpdateByHookPayload<CustomValue> = {
				method: Method.Update,
				key,
				path,
				type: Payload.Type.Hook,
				inputHook: inputDataOrHook
			};

			const preMiddlewares = this.middlewares.filterByCondition(Method.Update, Trigger.PreProvider);
			for (const middleware of preMiddlewares) payload = await middleware[Method.Update](payload);

			payload = await this.provider.updateByHook(payload);
			payload.trigger = Trigger.PostProvider;

			if (payload.error) throw payload.error;

			const postMiddlewares = this.middlewares.filterByCondition(Method.Update, Trigger.PostProvider);
			for (const middleware of postMiddlewares) payload = await middleware[Method.Update](payload);

			return payload.data ?? null;
		}

		let payload: UpdateByDataPayload<CustomValue> = { method: Method.Update, key, path, type: Payload.Type.Data, inputData: inputDataOrHook };

		const preMiddlewares = this.middlewares.filterByCondition(Method.Update, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Update](payload);

		payload = await this.provider.updateByData(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

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

		if (payload.error) throw payload.error;

		const postMiddlewares = this.middlewares.filterByCondition(Method.Values, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Values](payload);

		return payload.data;
	}

	public async init(): Promise<this> {
		await this.middlewares.loadAll();

		const context = await this.provider.init({ name: this.name, instance: this });

		if (context.error) throw context.error;

		return this;
	}

	public use(name: BuiltInMiddleware): this;
	public use(name: string): this {
		const middleware = this.middlewares.get(name);

		if (!middleware) throw new JoshError({ identifier: Josh.Identifiers.MiddlewareNotFound, message: `The middleware "${name}" does not exist.` });

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

	public static multi<Instances extends Record<string, Josh> = Record<string, Josh>>(
		names: string[],
		options: Omit<Josh.Options, 'name'> = {}
	): Instances {
		const instances: Record<string, Josh> = {};

		for (const [name, instance] of names.map((name) => [name, new Josh({ ...options, name })]) as [string, Josh][]) instances[name] = instance;

		// @ts-expect-error 2322
		return instances;
	}
}

export namespace Josh {
	export interface Options<Value = unknown> {
		name?: string;

		provider?: JoshProvider<Value>;

		middlewareDirectory?: string;

		middlewareContextData?: MiddlewareContextData<Value>;
	}

	export enum Identifiers {
		FilterInvalidPath = 'filterInvalidPath',

		FilterMissingValue = 'filterMissingValue',

		FindInvalidPath = 'findInvalidPath',

		FindMissingValue = 'findMissingValue',

		MissingName = 'missingName',

		InvalidProvider = 'invalidProvider',

		MiddlewareNotFound = 'middlewareNotFound',

		SomeInvalidPath = 'someInvalidPath',

		SomeMissingValue = 'someMissingValue'
	}
}

export enum Bulk {
	Object,

	Map,

	OneDimensionalArray,

	TwoDimensionalArray
}

export interface ReturnBulk<Value = unknown> {
	[Bulk.Object]: Record<string, Value>;

	[Bulk.Map]: Map<string, Value>;

	[Bulk.OneDimensionalArray]: Value[];

	[Bulk.TwoDimensionalArray]: [string, Value][];

	[K: string]: Record<string, Value> | Map<string, Value> | Value[] | [string, Value][];
}

export interface MiddlewareContextData<Value = unknown> {
	[BuiltInMiddleware.AutoEnsure]?: AutoEnsureContext<Value>;

	[K: string]: Middleware.Context | undefined;
}
