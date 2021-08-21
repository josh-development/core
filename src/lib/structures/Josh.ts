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
	EveryByDataPayload,
	EveryByHookPayload,
	EveryHook,
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
	MapByHookPayload,
	MapByPathPayload,
	MapHook,
	Payload,
	PushPayload,
	RandomKeyPayload,
	RandomPayload,
	RemoveByDataPayload,
	RemoveByHookPayload,
	RemoveHook,
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

/**
 * The base class that makes Josh work.
 * @see {@link Josh.Options} for all options available to the Josh class.
 * @since 2.0.0
 *
 * @example
 * ```typescript
 * const josh = new Josh({
 *   name: 'name',
 *   // More options...
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Using a provider.
 * const josh = new Josh({
 *   provider: new Provider(),
 *   // More options...
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Automatically scan from a specific directory.
 * // The main file is at `/hom/me/project/index.js`
 * // and all your pieces are at `/home/me/project/middlewares`
 * // NOTE: Do not use this option unless you know what you're doing.
 * const josh = new Josh({
 *   middlewareDirectory: join(__dirname, 'middlewares'),
 *   // More options
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Using middleware context
 * const josh = new Josh({
 *   middlewareContextData: {
 *     [BuiltInMiddleware.AutoEnsure]: {
 *       defaultValue: 'value'
 *     }
 *   },
 *   // More options...
 * });
 */
export class Josh<Value = unknown> {
	/**
	 * This Josh's name. Used for middleware and/or provider information.
	 * @since 2.0.0
	 */
	public name: string;

	/**
	 * This Josh's options. Used throughout the instance.
	 * @since 2.0.0
	 */
	public options: Josh.Options<Value>;

	/**
	 * The middleware store.
	 *
	 * NOTE: Do not use this unless you know what your doing.
	 * @since 2.0.0
	 */
	public middlewares: MiddlewareStore;

	/**
	 * This Josh's provider instance.
	 *
	 * NOTE: Do not use this unless you know what your doing.
	 */
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

	/**
	 * Generate an automatic key. Generally an integer incremented by `1`, but depends on provider.
	 * @since 2.0.0
	 * @returns The newly generated automatic key.
	 *
	 * @example
	 * ```typescript
	 * const key = await josh.autoKey();
	 *
	 * await josh.set(key, 'value');
	 * ```
	 */
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

	/**
	 * Decrement an integer by `1`.
	 * @since 2.0.0
	 * @param keyPath The key/path to the integer for decrementing.
	 * @returns The {@link Josh} instance.
	 *
	 * @example
	 * ```typescript
	 * await josh.set('key', 1);
	 *
	 * await josh.dec('key');
	 *
	 * await josh.get('key'); // 0
	 * ```
	 */
	public async dec(keyPath: KeyPath): Promise<this> {
		const [key, path] = this.getKeyPath(keyPath);
		let payload: DecPayload = { method: Method.Dec, trigger: Trigger.PreProvider, key, path };

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.Dec, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Dec](payload);

		payload = await this.provider.dec(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.Dec, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Dec](payload);

		return this;
	}

	/**
	 * Deletes a key or path in a key value.
	 * @since 2.0.0
	 * @param keyPath The key/path to delete from.
	 * @returns The {@link Josh} instance.
	 *
	 * @example
	 * ```typescript
	 * await josh.set('key', 'value');
	 *
	 * await josh.delete('key');
	 *
	 * await josh.get('key'); // null
	 * ```
	 *
	 * @example
	 * ```typescript
	 * await josh.set('key', { key: 'value' });
	 *
	 * await josh.delete(['key', ['key']]);
	 *
	 * await josh.get('key'); // {}
	 * ```
	 */
	public async delete(keyPath: KeyPath): Promise<this> {
		const [key, path] = this.getKeyPath(keyPath);
		let payload: DeletePayload = { method: Method.Delete, trigger: Trigger.PreProvider, key, path };

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.Delete, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Delete](payload);

		payload = await this.provider.delete(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.Delete, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Delete](payload);

		return this;
	}

	/**
	 * Ensure a key exists and set a default value if it doesn't.
	 * @since 2.0.0
	 * @param key The key to ensure.
	 * @param defaultValue The default value to set if the key doesn't exist.
	 * @returns The value gotten from the key.
	 *
	 * @example
	 * ```typescript
	 * await josh.ensure('key', 'defaultValue'); // 'defaultValue'
	 * ```
	 *
	 * @example
	 * ```typescript
	 * await josh.set('key', 'value');
	 *
	 * await josh.ensure('key', 'defaultValue'); // 'value'
	 * ```
	 */
	public async ensure<CustomValue = Value>(key: string, defaultValue: CustomValue): Promise<CustomValue> {
		let payload: EnsurePayload<CustomValue> = { method: Method.Ensure, trigger: Trigger.PreProvider, key, data: defaultValue, defaultValue };

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.Ensure, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Ensure](payload);

		payload = await this.provider.ensure(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.Ensure, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Ensure](payload);

		return payload.data;
	}

	public async every<CustomValue = Value>(path: string[], value: CustomValue): Promise<boolean>;
	public async every<CustomValue = Value>(hook: EveryHook<CustomValue>, path?: string[]): Promise<boolean>;
	public async every<CustomValue = Value>(pathOrHook: string[] | EveryHook<CustomValue>, pathOrValue?: string[] | CustomValue): Promise<boolean> {
		if (Array.isArray(pathOrHook)) {
			if (pathOrValue === undefined)
				throw new JoshError({
					identifier: Josh.Identifiers.EveryMissingValue,
					message: 'The "value" parameter is required when using every by data.'
				});

			let payload: EveryByDataPayload<CustomValue> = {
				method: Method.Every,
				trigger: Trigger.PreProvider,
				type: Payload.Type.Data,
				path: pathOrHook,
				inputData: pathOrValue as CustomValue,
				data: true
			};

			for (const middleware of this.middlewares.array()) await middleware.run(payload);

			const preMiddlewares = this.middlewares.filterByCondition(Method.Every, Trigger.PreProvider);
			for (const middleware of preMiddlewares) payload = await middleware[Method.Every](payload);

			payload = await this.provider.everyByData(payload);
			payload.trigger = Trigger.PostProvider;

			if (payload.error) throw payload.error;

			for (const middleware of this.middlewares.array()) await middleware.run(payload);

			const postMiddlewares = this.middlewares.filterByCondition(Method.Every, Trigger.PostProvider);
			for (const middleware of postMiddlewares) payload = await middleware[Method.Every](payload);

			return payload.data;
		}

		if (pathOrValue !== undefined && !Array.isArray(pathOrValue))
			throw new JoshError({ identifier: Josh.Identifiers.EveryInvalidPath, message: 'The path parameter must be an array of strings.' });

		let payload: EveryByHookPayload<CustomValue> = {
			method: Method.Every,
			trigger: Trigger.PreProvider,
			type: Payload.Type.Hook,
			path: pathOrValue as string[] | undefined,
			inputHook: pathOrHook,
			data: true
		};

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.Every, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Every](payload);

		payload = await this.provider.everyByHook(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.Every, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Every](payload);

		return payload.data;
	}

	/**
	 * Filter data using a path and value.
	 * @since 2.0.0
	 * @param path The path array to check on stored data.
	 * @param value The value to check against the data at path.
	 * @param returnBulkType The return bulk type. Defaults to {@link Bulk.Object}
	 * @returns The bulk data.
	 */
	public async filter<CustomValue = Value, K extends keyof ReturnBulk<CustomValue> = Bulk.Object>(
		path: string[],
		value: CustomValue,
		returnBulkType?: K
	): Promise<ReturnBulk<CustomValue>[K]>;

	/** Filter data using a function and optional path.
	 * @since 2.0.0
	 * @param hook The function to run on stored data.
	 * @param path The optional path array to get on stored data and pass to the function.
	 * @param returnBulkType The return bulk type. Defaults to {@link Bulk.Object}
	 * @returns The bulk data.
	 */
	public async filter<CustomValue = Value, K extends keyof ReturnBulk<CustomValue> = Bulk.Object>(
		hook: FilterHook<CustomValue>,
		path?: string[],
		returnBulkType?: K
	): Promise<ReturnBulk<CustomValue>[K]>;

	/**
	 * Filter data using a path and value or function and optional path.
	 * @param pathOrHook The path array or function.
	 * @param pathOrValue The value or path array.
	 * @param returnBulkType The return bulk type. Defaults to {@link Bulk.Object}
	 * @returns The bulk data.
	 */
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

			for (const middleware of this.middlewares.array()) await middleware.run(payload);

			const preMiddlewares = this.middlewares.filterByCondition(Method.Filter, Trigger.PreProvider);
			for (const middleware of preMiddlewares) payload = await middleware[Method.Filter](payload);

			payload = await this.provider.filterByData(payload);
			payload.trigger = Trigger.PostProvider;

			if (payload.error) throw payload.error;

			for (const middleware of this.middlewares.array()) await middleware.run(payload);

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

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.Filter, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Filter](payload);

		payload = await this.provider.filterByHook(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.Filter, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Filter](payload);

		return this.convertBulkData(payload.data, returnBulkType);
	}

	/**
	 * Find data using a path and value.
	 * @since 2.0.0
	 * @param path The path array to check on stored data.
	 * @param value The value to check against the data at path.
	 * @returns The data found or `null`.
	 */
	public async find<CustomValue = Value>(path: string[], value: CustomValue): Promise<CustomValue>;

	/**
	 * Find data using a function and optional path.
	 * @since 2.0.0
	 * @param hook The function to run on stored data.
	 * @param path The optional path array to get on stored data and pass to the function.
	 * @returns The data found or `null`.
	 */
	public async find<CustomValue = Value>(hook: FindHook<CustomValue>, path?: string[]): Promise<CustomValue | null>;

	/**
	 * Find data using a path and value or function and optional path.
	 * @param pathOrHook The path array or function.
	 * @param pathOrValue The value or path array.
	 * @returns The data found or `null`.
	 */
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

			for (const middleware of this.middlewares.array()) await middleware.run(payload);

			const preMiddlewares = this.middlewares.filterByCondition(Method.Find, Trigger.PreProvider);
			for (const middleware of preMiddlewares) payload = await middleware[Method.Find](payload);

			payload = await this.provider.findByData(payload);
			payload.trigger = Trigger.PostProvider;

			if (payload.error) throw payload.error;

			for (const middleware of this.middlewares.array()) await middleware.run(payload);

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

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.Find, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Find](payload);

		payload = await this.provider.findByHook(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.Find, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Find](payload);

		return payload.data ?? null;
	}

	/**
	 * Get data at a specific key/path.
	 * @since 2.0.0
	 * @param keyPath The key/path to get data from.
	 * @returns The data found or `null`.
	 *
	 * @example
	 * ```typescript
	 * await josh.set('key', 'value');
	 *
	 * await josh.get('key'); // 'value'
	 * ```
	 *
	 * @example
	 * ```typescript
	 * await josh.set('key', { path: 'value' });
	 *
	 * await josh.get(['key', ['path']]); // 'value'
	 * ```
	 */
	public async get<CustomValue = Value>(keyPath: KeyPath): Promise<CustomValue | null> {
		const [key, path] = this.getKeyPath(keyPath);
		let payload: GetPayload<CustomValue> = { method: Method.Get, trigger: Trigger.PreProvider, key, path };

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.Get, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Get](payload);

		payload = await this.provider.get(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.Get, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Get](payload);

		return payload.data ?? null;
	}

	/**
	 * Get all data.
	 * @since 2.0.0
	 * @param returnBulkType The return bulk type. Defaults to {@link Bulk.Object}
	 * @returns The bulk data.
	 *
	 * @example
	 * ```typescript
	 * await josh.set('key', 'value');
	 *
	 * await josh.getAll(); // { key: 'value' }
	 * // Using a return bulk type.
	 * await josh.getAll(Bulk.OneDimensionalArray); // ['value']
	 * ```
	 *
	 * @example
	 * ```typescript
	 * await josh.set('key', { path: 'value' });
	 *
	 * await josh.getAll(); // { key: { path: 'value' } }
	 * // Using a return bulk type.
	 * await josh.getAll(Bulk.TwoDimensionalArray); // [['key', { path: 'value' }]]
	 * ```
	 */
	public async getAll<CustomValue = Value, K extends keyof ReturnBulk<CustomValue> = Bulk.Object>(
		returnBulkType?: K
	): Promise<ReturnBulk<CustomValue>[K]> {
		let payload: GetAllPayload<CustomValue> = { method: Method.GetAll, trigger: Trigger.PreProvider, data: {} };

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.GetAll, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.GetAll](payload);

		payload = await this.provider.getAll(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.GetAll, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.GetAll](payload);

		return this.convertBulkData(payload.data, returnBulkType);
	}

	/**
	 * Get data at many key/paths.
	 * @since 2.0.0
	 * @param keyPaths The key/paths to get from.
	 * @param returnBulkType The return bulk type. Defaults to {@link Bulk.Object}
	 * @returns The bulk data.
	 *
	 * @example
	 * ```typescript
	 * await josh.set('key', 'value');
	 *
	 * await josh.getMany([['key', []]]); // { key: 'value' };
	 * // Using a return bulk type.
	 * await josh.getMany([['key', []]], Bulk.OneDimensionalArray); // ['value']
	 * ```
	 *
	 * @example
	 * ```typescript
	 * await josh.set('key', { path: 'value' });
	 *
	 * await josh.getMany([['key', ['path']]]); // { key: 'value' }
	 * // Using a return bulk type.
	 * await josh.getMany([['key', ['path]]], Bulk.TwoDimensionalArray); // [['key', 'value']]
	 * ```
	 */
	public async getMany<CustomValue = Value, K extends keyof ReturnBulk<CustomValue> = Bulk.Object>(
		keyPaths: KeyPathArray[],
		returnBulkType?: K
	): Promise<ReturnBulk<CustomValue | null>[K]> {
		let payload: GetManyPayload<CustomValue> = { method: Method.GetMany, trigger: Trigger.PreProvider, keyPaths, data: {} };

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.GetMany, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.GetMany](payload);

		payload = await this.provider.getMany(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.GetMany, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.GetMany](payload);

		return this.convertBulkData(payload.data, returnBulkType);
	}

	public async has(keyPath: KeyPath): Promise<boolean> {
		const [key, path] = this.getKeyPath(keyPath);
		let payload: HasPayload = { method: Method.Has, trigger: Trigger.PreProvider, key, path, data: false };

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.Has, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Has](payload);

		payload = await this.provider.has(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.Has, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Has](payload);

		return payload.data;
	}

	/**
	 * Increment an integer by `1`.
	 * @since 2.0.0
	 * @param keyPath The key/path to the integer for incrementing.
	 * @returns The {@link Josh} instance.
	 *
	 * @example
	 * ```typescript
	 * await josh.set('key', 0);
	 *
	 * await josh.inc('key');
	 *
	 * await josh.get('key'); // 1
	 * ```
	 */
	public async inc(keyPath: KeyPath): Promise<this> {
		const [key, path] = this.getKeyPath(keyPath);
		let payload: IncPayload = { method: Method.Inc, trigger: Trigger.PreProvider, key, path };

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.Inc, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Inc](payload);

		payload = await this.provider.inc(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.Inc, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Inc](payload);

		return this;
	}

	/**
	 * Get an array of keys.
	 * @since 2.0.0
	 * @returns The array of string keys.
	 *
	 * @example
	 * ```typescript
	 * await josh.set('key', 'value');
	 *
	 * await josh.keys(); // ['key']
	 * ```
	 */
	public async keys(): Promise<string[]> {
		let payload: KeysPayload = { method: Method.Keys, trigger: Trigger.PreProvider, data: [] };

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.Keys, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Keys](payload);

		payload = await this.provider.keys(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.Keys, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Keys](payload);

		return payload.data;
	}

	/**
	 * Map all stored data to an array.
	 * @since 2.0.0
	 * @param pathOrHook A path array or hook function.
	 * @returns The mapped data.
	 *
	 * @example
	 * ```typescript
	 * await josh.setMany([['key', []], ['anotherKey', []]], { path: 'value' });
	 *
	 * await josh.map((data) => data.path); // ['value', 'value']
	 * ```
	 */
	public async map<CustomValue = Value>(pathOrHook: string[] | MapHook<CustomValue>): Promise<CustomValue[]> {
		if (isFunction(pathOrHook)) {
			let payload: MapByHookPayload<CustomValue> = { method: Method.Map, type: Payload.Type.Hook, hook: pathOrHook, data: [] };

			for (const middleware of this.middlewares.array()) await middleware.run(payload);

			const preMiddlewares = this.middlewares.filterByCondition(Method.Map, Trigger.PreProvider);
			for (const middleware of preMiddlewares) payload = await middleware[Method.Map](payload);

			payload = await this.provider.mapByHook(payload);
			payload.trigger = Trigger.PostProvider;

			for (const middleware of this.middlewares.array()) await middleware.run(payload);

			const postMiddlewares = this.middlewares.filterByCondition(Method.Map, Trigger.PostProvider);
			for (const middleware of postMiddlewares) payload = await middleware[Method.Map](payload);

			return payload.data;
		}

		let payload: MapByPathPayload<CustomValue> = { method: Method.Map, type: Payload.Type.Path, path: pathOrHook, data: [] };

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.Map, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Map](payload);

		payload = await this.provider.mapByPath(payload);
		payload.trigger = Trigger.PostProvider;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.Map, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Map](payload);

		return payload.data;
	}

	/**
	 * Push a value to an array at a specific key/value.
	 * @since 2.0.0
	 * @param keyPath The key/path to the array for pushing.
	 * @param value The value to push to the array.
	 * @returns The {@link Josh} instance.
	 */
	public async push<CustomValue = Value>(keyPath: KeyPath, value: CustomValue): Promise<this> {
		const [key, path] = this.getKeyPath(keyPath);
		let payload: PushPayload = { method: Method.Push, trigger: Trigger.PreProvider, key, path };

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.Push, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Push](payload);

		payload = await this.provider.push(payload, value);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.Push, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Push](payload);

		return this;
	}

	/**
	 * Get a random value.
	 * @since 2.0.0
	 * @returns The random data or `null`.
	 */
	public async random<CustomValue = Value>(): Promise<CustomValue | null> {
		let payload: RandomPayload<CustomValue> = { method: Method.Random, trigger: Trigger.PreProvider };

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.Random, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Random](payload);

		payload = await this.provider.random(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.Random, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Random](payload);

		return payload.data ?? null;
	}

	/**
	 * Get a random key.
	 * @since 2.0.0
	 * @returns The random key or `null`.
	 */
	public async randomKey(): Promise<string | null> {
		let payload: RandomKeyPayload = { method: Method.RandomKey, trigger: Trigger.PreProvider };

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.RandomKey, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.RandomKey](payload);

		payload = await this.provider.randomKey(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.RandomKey, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.RandomKey](payload);

		return payload.data ?? null;
	}

	public async remove<CustomValue = Value>(keyPath: KeyPath, inputDataOrHook: CustomValue | RemoveHook<CustomValue>): Promise<this> {
		const [key, path] = this.getKeyPath(keyPath);

		if (isFunction(inputDataOrHook)) {
			let payload: RemoveByHookPayload<CustomValue> = { method: Method.Remove, type: Payload.Type.Hook, key, path, inputHook: inputDataOrHook };

			for (const middleware of this.middlewares.array()) await middleware.run(payload);

			const preMiddlewares = this.middlewares.filterByCondition(Method.Remove, Trigger.PreProvider);
			for (const middleware of preMiddlewares) payload = await middleware[Method.Remove](payload);

			payload = await this.provider.removeByHook(payload);
			payload.trigger = Trigger.PostProvider;

			if (payload.error) throw payload.error;

			for (const middleware of this.middlewares.array()) await middleware.run(payload);

			const postMiddlewares = this.middlewares.filterByCondition(Method.Remove, Trigger.PostProvider);
			for (const middleware of postMiddlewares) payload = await middleware[Method.Remove](payload);

			return this;
		}

		let payload: RemoveByDataPayload<CustomValue> = { method: Method.Remove, type: Payload.Type.Data, key, path, inputData: inputDataOrHook };

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.Remove, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Remove](payload);

		payload = await this.provider.removeByData(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.Remove, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Remove](payload);

		return this;
	}

	/**
	 * Set data at a specific key/path.
	 * @since 2.0.0
	 * @param keyPath The key/path to the data for setting.
	 * @param value The value to set at the key/path.
	 * @returns The {@link Josh} instance.
	 *
	 * @example
	 * ```typescript
	 * await josh.set('key', 'value');
	 *
	 * await josh.get('key'); // 'value';
	 * ```
	 */
	public async set<CustomValue = Value>(keyPath: KeyPath, value: CustomValue): Promise<this> {
		const [key, path] = this.getKeyPath(keyPath);
		let payload: SetPayload = { method: Method.Set, trigger: Trigger.PreProvider, key, path };

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.Set, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Set](payload);

		payload = await this.provider.set(payload, value);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.Set, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Set](payload);

		return this;
	}

	/**
	 * Set data at many key/paths.
	 * @since 2.0.0
	 * @param keyPaths The key/paths to the data for setting.
	 * @param value The value to set at the key/paths.
	 * @returns The {@link Josh} instance.
	 *
	 * @example
	 * ```typescript
	 * await josh.setMany([['key', []]], 'value');
	 *
	 * await josh.getMany([['key', []]]); // { key: 'value' }
	 * ```
	 */
	public async setMany<CustomValue = Value>(keyPaths: [string, string[]][], value: CustomValue): Promise<this> {
		let payload: SetManyPayload = { method: Method.SetMany, trigger: Trigger.PreProvider, keyPaths };

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.SetMany, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.SetMany](payload);

		payload = await this.provider.setMany(payload, value);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.SetMany, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.SetMany](payload);

		return this;
	}

	/**
	 * Get the amount of key/values
	 * @since 2.0.0
	 * @returns The number amount.
	 *
	 * @example
	 * ```typescript
	 * await josh.size(); // 0
	 * ```
	 */
	public async size(): Promise<number> {
		let payload: SizePayload = { method: Method.Size, trigger: Trigger.PreProvider, data: 0 };

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.Size, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Size](payload);

		payload = await this.provider.size(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.Size, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Size](payload);

		return payload.data;
	}

	/**
	 * Check if data matches with a path and value.
	 * @since 2.0.0
	 * @param path The path array to check on stored data.
	 * @param value The value to check against the data at path.
	 * @returns Whether the data check is `true` or `false`.
	 */
	public async some<CustomValue = Value>(path: string[], value: CustomValue): Promise<boolean>;

	/**
	 * Check if data matches with a function and optional path.
	 * @since 2.0.0
	 * @param hook  The function to run on stored data.
	 * @param path The optional path array to get on stored data and pass to the function.
	 * @returns Whether the data check is `true` or `false`.
	 */
	public async some<CustomValue = Value>(hook: SomeHook<CustomValue>, path?: string[]): Promise<boolean>;

	/**
	 * Check if data matches with a path and value or function and optional path.
	 * @since 2.0.0
	 * @param pathOrHook The path array or function.
	 * @param pathOrValue The value or path array.
	 * @returns Whether the data check is `true` or `false`.
	 */
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

			for (const middleware of this.middlewares.array()) await middleware.run(payload);

			const preMiddlewares = this.middlewares.filterByCondition(Method.Some, Trigger.PreProvider);
			for (const middleware of preMiddlewares) payload = await middleware[Method.Some](payload);

			payload = await this.provider.someByData(payload);
			payload.trigger = Trigger.PostProvider;

			if (payload.error) throw payload.error;

			for (const middleware of this.middlewares.array()) await middleware.run(payload);

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

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.Some, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Some](payload);

		payload = await this.provider.someByHook(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.Some, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Some](payload);

		return payload.data;
	}

	/**
	 * Update data at a specific key/path.
	 * @since 2.0.0
	 * @param keyPath The key/path to data for updating.
	 * @param inputDataOrHook The input, either a value or a function.
	 * @returns The updated value or `null` if the data doesn't exist.
	 *
	 * @example
	 * ```typescript
	 * await josh.set('key', 'value');
	 *
	 * await josh.update('key', 'anotherValue'); // 'anotherValue'
	 * ```
	 *
	 * @example
	 * ```typescript
	 * await josh.set('key', { path: 'value' })
	 *
	 * await josh.update('key', (data) => {
	 *   data.anotherPath = 'anotherValue';
	 *
	 *   return data;
	 * }); // { path: 'value', anotherPath: 'anotherValue' }
	 * ```
	 */
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

			for (const middleware of this.middlewares.array()) await middleware.run(payload);

			const preMiddlewares = this.middlewares.filterByCondition(Method.Update, Trigger.PreProvider);
			for (const middleware of preMiddlewares) payload = await middleware[Method.Update](payload);

			payload = await this.provider.updateByHook(payload);
			payload.trigger = Trigger.PostProvider;

			if (payload.error) throw payload.error;

			for (const middleware of this.middlewares.array()) await middleware.run(payload);

			const postMiddlewares = this.middlewares.filterByCondition(Method.Update, Trigger.PostProvider);
			for (const middleware of postMiddlewares) payload = await middleware[Method.Update](payload);

			return payload.data ?? null;
		}

		let payload: UpdateByDataPayload<CustomValue> = { method: Method.Update, key, path, type: Payload.Type.Data, inputData: inputDataOrHook };

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.Update, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Update](payload);

		payload = await this.provider.updateByData(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.Update, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Update](payload);

		return payload.data ?? null;
	}

	/**
	 * Get all data values.
	 * @since 2.0.0
	 * @returns An array of data values.
	 *
	 * @example
	 * ```typescript
	 * await josh.set('key', 'value');
	 * await josh.set('anotherKey', 'anotherValue');
	 *
	 * await josh.values(); // ['value', 'anotherValue']
	 * ```
	 */
	public async values<CustomValue = Value>(): Promise<CustomValue[]> {
		let payload: ValuesPayload<CustomValue> = { method: Method.Values, trigger: Trigger.PreProvider, data: [] };

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const preMiddlewares = this.middlewares.filterByCondition(Method.Values, Trigger.PreProvider);
		for (const middleware of preMiddlewares) payload = await middleware[Method.Values](payload);

		payload = await this.provider.values(payload);
		payload.trigger = Trigger.PostProvider;

		if (payload.error) throw payload.error;

		for (const middleware of this.middlewares.array()) await middleware.run(payload);

		const postMiddlewares = this.middlewares.filterByCondition(Method.Values, Trigger.PostProvider);
		for (const middleware of postMiddlewares) payload = await middleware[Method.Values](payload);

		return payload.data;
	}

	/**
	 * The initialization method for Josh.
	 * @since 2.0.0
	 * @returns The {@link Josh} instance
	 *
	 * @example
	 * ```typescript
	 * await josh.init();
	 * ```
	 */
	public async init(): Promise<this> {
		await this.middlewares.loadAll();

		const context = await this.provider.init({ name: this.name, instance: this });

		if (context.error) throw context.error;

		return this;
	}

	/**
	 * Enables a middleware that was not enabled by default.
	 * @since 2.0.0
	 * @param name The name of the middleware to enable.
	 */
	public use(name: string): this {
		const middleware = this.middlewares.get(name);

		if (!middleware) throw new JoshError({ identifier: Josh.Identifiers.MiddlewareNotFound, message: `The middleware "${name}" does not exist.` });

		middleware.use = true;

		this.middlewares.set(name, middleware);

		return this;
	}

	/** A private method for converting bulk data.
	 * @since 2.0.0
	 * @private
	 * @param data The data to convert.
	 * @param returnBulkType The return bulk type. Defaults to {@link Bulk.Object}
	 * @returns The bulk data.
	 */
	private convertBulkData<CustomValue = Value, K extends keyof ReturnBulk<CustomValue> = Bulk.Object>(
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

	/**
	 * A private method for extracting the key/path from a {@link KeyPath} type.
	 * @since 2.0.0
	 * @private
	 * @param keyPath The key/path to extract from.
	 * @returns The extracted key/path data.
	 */
	private getKeyPath(keyPath: KeyPath): [string, string[] | undefined] {
		if (typeof keyPath === 'string') return [keyPath, undefined];

		return keyPath;
	}

	/**
	 * A static method to create multiple instances of {@link Josh}.
	 * @since 2.0.0
	 * @param names The names to give each instance of {@link Josh}
	 * @param options The options to give all the instances.
	 * @returns
	 */
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
	/**
	 * The options for {@link Josh}.
	 * @since 2.0.0
	 */
	export interface Options<Value = unknown> {
		/**
		 * The name for the Josh instance.
		 * @since 2.0.0
		 */
		name?: string;

		/**
		 * The provider instance.
		 * @since 2.0.0
		 */
		provider?: JoshProvider<Value>;

		/**
		 * The middleware directory.
		 * @since 2.0.0
		 */
		middlewareDirectory?: string;

		/**
		 * The middleware context data.
		 * @since 2.0.0
		 */
		middlewareContextData?: MiddlewareContextData<Value>;
	}

	export enum Identifiers {
		EveryInvalidPath = 'everyInvalidPath',

		EveryMissingValue = 'everyMissingValue',

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

/**
 * The context data for middlewares. Indexed by their keys being the name of the middleware.
 * @since 2.0.0
 */
export interface MiddlewareContextData<Value = unknown> {
	[BuiltInMiddleware.AutoEnsure]?: AutoEnsureContext<Value>;

	[K: string]: Middleware.Context | undefined;
}
