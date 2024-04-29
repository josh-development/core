import { AutoEnsureMiddleware } from '@joshdb/auto-ensure';
import { MapProvider } from '@joshdb/map';
import type { KeyPath, KeyPathJSON, MathOperator, Path } from '@joshdb/provider';
import {
  CommonIdentifiers,
  JoshMiddleware,
  JoshMiddlewareStore,
  JoshProvider,
  Method,
  Payload,
  Trigger,
  isPayloadWithData,
  resolveCommonIdentifier
} from '@joshdb/provider';
import type { Awaitable, NonNullObject, Primitive } from '@sapphire/utilities';
import { isFunction, isPrimitive } from '@sapphire/utilities';
import { JoshError, type JoshErrorOptions } from './JoshError';

/**
 * The base class that makes Josh work.
 * @see {@link Josh.Options} for all options available to the Josh class.
 * @since 2.0.0
 *
 * @example
 * ```javascript
 * // Using the default map non-persistent provider
 * const josh = new Josh({
 *   name: 'database',
 *   // More options...
 * });
 * ```
 *
 * @example
 * ```javascript
 * // Using a provider.
 * const josh = new Josh({
 *   name: 'database',
 *   provider: new Provider(),
 *   // More options...
 * });
 * ```
 * @example
 * ```typescript
 * // TypeScript example
 * const josh = new Josh<{ username: string }>({
 *   name: 'database'
 * });
 * ```
 */
export class Josh<StoredValue = unknown> {
  /**
   * This Josh's name. Used for middleware and/or provider information.
   * @since 2.0.0
   */
  public name: string;

  /**
   * This Josh's options. Used throughout the instance.
   * @since 2.0.0
   */
  public options: Josh.Options<StoredValue>;

  /**
   * This Josh's middleware store.
   *
   * NOTE: Do not use this unless you know what your doing.
   * @since 2.0.0
   */
  public middlewares: JoshMiddlewareStore<StoredValue>;

  /**
   * This Josh's provider instance.
   *
   * NOTE: Do not use this unless you know what your doing.
   */
  public provider: JoshProvider<StoredValue>;

  public constructor(options: Josh.Options<StoredValue>) {
    const { name, provider, middlewares, autoEnsure } = options;

    this.options = options;

    if (!name) {
      throw this.error(Josh.Identifiers.MissingName);
    }

    this.name = name;
    this.provider = provider ?? new MapProvider<StoredValue>();

    if (!(this.provider instanceof JoshProvider)) {
      process.emitWarning(this.resolveIdentifier(Josh.Identifiers.InvalidProvider));
    }

    this.middlewares = new JoshMiddlewareStore<StoredValue>({ provider: this.provider });

    if (autoEnsure !== undefined) {
      this.use(new AutoEnsureMiddleware<StoredValue>(autoEnsure));
    }

    if (middlewares !== undefined && Array.isArray(middlewares)) {
      const filteredMiddleware = middlewares.filter((middleware) => {
        if (!(middleware instanceof JoshMiddleware)) {
          process.emitWarning(this.resolveIdentifier(Josh.Identifiers.InvalidMiddleware));
        }

        return middleware instanceof JoshMiddleware;
      });

      for (const middleware of filteredMiddleware) {
        this.use(middleware);
      }
    }
  }

  private get providerDataFailedError(): JoshError {
    return this.error(Josh.Identifiers.ProviderDataFailed);
  }

  /**
   * The initialization method for Josh.
   * @since 2.0.0
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * await josh.init();
   * ```
   * @example
   * ```javascript
   * josh.init().then(() => console.log('Initialized Josh!'));
   * ```
   */
  public async init(): Promise<this> {
    await this.provider.init({ name: this.name });

    for (const middleware of this.middlewares.values()) {
      await middleware.init(this.middlewares);
    }

    return this;
  }

  /**
   * Adds a middleware by providing options and a hook.
   * @since 2.0.0
   * @param options The options for this middleware instance.
   * @param hook The hook to run for the payload.
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * josh.use({ name: 'my-middleware' }, (payload) => payload);
   * ```
   */
  public use<P extends Payload>(options: Josh.UseMiddlewareOptions, hook: (payload: P) => Awaitable<P>): this;

  /**
   * Adds a middleware by providing a JoshMiddleware instance.
   * @since 2.0.0
   * @param instance The middleware instance.
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * josh.use(new MyMiddleware());
   * ```
   */
  public use(instance: JoshMiddleware<NonNullObject, StoredValue>): this;
  public use<P extends Payload>(
    optionsOrInstance: Josh.UseMiddlewareOptions | JoshMiddleware<NonNullObject, StoredValue>,
    hook?: (payload: P) => Awaitable<P>
  ): this {
    if (optionsOrInstance instanceof JoshMiddleware) {
      this.middlewares.set(optionsOrInstance.name, optionsOrInstance);
    } else {
      if (hook === undefined) {
        throw this.error(Josh.Identifiers.UseMiddlewareHookNotFound);
      }

      const { name, trigger, method } = optionsOrInstance;
      const options: JoshMiddleware.Options = { name, conditions: { [Trigger.PreProvider]: [], [Trigger.PostProvider]: [] } };
      // @ts-ignore Until provider updates
      const middleware = this.middlewares.get(options.name) ?? new JoshMiddleware<NonNullObject, StoredValue>({}, options);

      if (trigger !== undefined && method !== undefined) {
        options.conditions[trigger].push(method);
      }

      Object.defineProperty(middleware, method === undefined ? 'run' : method, { value: hook });
      this.middlewares.set(middleware.name, middleware);
    }

    return this;
  }

  /**
   * Generate an automatic key. Generally an integer incremented by `1`, but depends on provider.
   * @since 2.0.0
   * @returns The newly generated automatic key.
   *
   * @example
   * ```javascript
   * const key = await josh.autoKey();
   *
   * await josh.set(key, 'value');
   * ```
   */
  public async autoKey(): Promise<string> {
    let payload: Payload.AutoKey = { method: Method.AutoKey, errors: [], trigger: Trigger.PreProvider };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.AutoKey)) {
      payload = await middleware[Method.AutoKey](payload);
    }

    if (!isPayloadWithData<string>(payload)) {
      payload = await this.provider[Method.AutoKey](payload);
    }

    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.AutoKey)) {
      payload = await middleware[Method.AutoKey](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    if (isPayloadWithData<string>(payload)) {
      return payload.data;
    }

    throw this.providerDataFailedError;
  }

  /**
   * Clears all stored values from the provider.
   *
   * NOTE: This deletes **all** data and cannot be reversed.
   * @since 2.0.0
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value');
   *
   * await josh.clear();
   *
   * await josh.get('key'); // null
   * ```
   */
  public async clear(): Promise<this> {
    let payload: Payload.Clear = { method: Method.Clear, errors: [], trigger: Trigger.PreProvider };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Clear)) {
      payload = await middleware[Method.Clear](payload);
    }

    payload = await this.provider[Method.Clear](payload);
    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Clear)) {
      payload = await middleware[Method.Clear](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    return this;
  }

  /**
   * Decrement a stored integer by `1`.
   * @since 2.0.0
   * @param key The key of the integer to decrement.
   * @param path The path to the integer for decrementing.
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * await josh.set('key', 1);
   *
   * await josh.dec('key');
   *
   * await josh.get('key'); // 0
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', 1, 'path');
   *
   * await josh.dec('key', 'path');
   *
   * await josh.get('key', 'path'); // 0
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', 1, 'path');
   *
   * await josh.dec('key', ['path']);
   *
   * await josh.get('key', 'path'); // 0
   * ```
   */
  public async dec(key: string, path: Path = []): Promise<this> {
    path = this.resolvePath(path);

    let payload: Payload.Dec = { method: Method.Dec, errors: [], trigger: Trigger.PreProvider, key, path };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Dec)) {
      payload = await middleware[Method.Dec](payload);
    }

    payload = await this.provider[Method.Dec](payload);
    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Dec)) {
      payload = await middleware[Method.Dec](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    return this;
  }

  /**
   * Deletes a key or path in a key value.
   * @since 2.0.0
   * @param key The key to delete from.
   * @param path The path to delete from.
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value');
   *
   * await josh.delete('key');
   *
   * await josh.get('key'); // null
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', { path: 'value' });
   *
   * await josh.delete('key', 'path');
   *
   * await josh.get('key'); // {}
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', { path: 'value' });
   *
   * await josh.delete('key', ['path']);
   *
   * await josh.get('key'); // {}
   * ```
   */
  public async delete(key: string, path: Path = []): Promise<this> {
    path = this.resolvePath(path);

    let payload: Payload.Delete = { method: Method.Delete, errors: [], trigger: Trigger.PreProvider, key, path };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Delete)) {
      payload = await middleware[Method.Delete](payload);
    }

    payload = await this.provider[Method.Delete](payload);
    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Delete)) {
      payload = await middleware[Method.Delete](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    return this;
  }

  /**
   * Deletes many keys.
   * @since 2.0.0
   * @param keys The keys to delete.
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value');
   *
   * await josh.deleteMany(['key']);
   *
   * await josh.get('key'); // null
   * ```
   */
  public async deleteMany(keys: string[]): Promise<this> {
    let payload: Payload.DeleteMany = { method: Method.DeleteMany, errors: [], trigger: Trigger.PreProvider, keys };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.DeleteMany)) {
      payload = await middleware[Method.DeleteMany](payload);
    }

    payload = await this.provider[Method.DeleteMany](payload);
    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.DeleteMany)) {
      payload = await middleware[Method.DeleteMany](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    return this;
  }

  /**
   * Loop over every key-value pair in this {@link Josh} and execute `hook` on it.
   * @since 2.0.0
   * @param hook The hook function to execute with each key.
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value');
   *
   * await josh.each((value, key) => console.log(key + ' = ' + value)); // key = value
   * ```
   */
  public async each(hook: Payload.Hook<StoredValue>): Promise<this> {
    let payload: Payload.Each<StoredValue> = { method: Method.Each, errors: [], trigger: Trigger.PreProvider, hook };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Each)) {
      payload = await middleware[Method.Each](payload);
    }

    if (!payload.metadata?.skipProvider) {
      payload = await this.provider[Method.Each](payload);
    }

    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Each)) {
      payload = await middleware[Method.Each](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    return this;
  }

  /**
   * Ensure a key exists and set a default value if it doesn't.
   * @since 2.0.0
   * @param key The key to ensure.
   * @param defaultValue The default value to set if the key doesn't exist.
   * @returns The value gotten from the key or the default value.
   *
   * @example
   * ```javascript
   * await josh.ensure('key', 'defaultValue'); // 'defaultValue'
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value');
   *
   * await josh.ensure('key', 'defaultValue'); // 'value'
   * ```
   */
  public async ensure(key: string, defaultValue: StoredValue): Promise<StoredValue> {
    let payload: Payload.Ensure<StoredValue> = { method: Method.Ensure, errors: [], trigger: Trigger.PreProvider, key, defaultValue };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Ensure)) {
      payload = await middleware[Method.Ensure](payload);
    }

    if (!isPayloadWithData<StoredValue>(payload)) {
      payload = await this.provider[Method.Ensure](payload);
    }

    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Ensure)) {
      payload = await middleware[Method.Ensure](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    if (isPayloadWithData<StoredValue>(payload)) {
      return payload.data;
    }

    throw this.providerDataFailedError;
  }

  /**
   * Get all stored values.
   * @since 2.0.0
   * @param returnBulkType The return bulk type. Defaults to {@link Bulk.Object}
   * @returns The bulk data.

   * @example
   * ```javascript
   * await josh.set('key', 'value');
   *
   * await josh.entries(); // { key: 'value' }
   * await josh.entries(Bulk.OneDimensionalArray); // ['value']
   * await josh.entries(Bulk.TwoDimensionalArray); // [['key', { path: 'value' }]]
   * ```
   */
  public async entries<BulkType extends keyof ReturnBulk<StoredValue> = Bulk.Object>(
    returnBulkType?: BulkType
  ): Promise<ReturnBulk<StoredValue>[BulkType]> {
    let payload: Payload.Entries<StoredValue> = { method: Method.Entries, errors: [], trigger: Trigger.PreProvider };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Entries)) {
      payload = await middleware[Method.Entries](payload);
    }

    if (!isPayloadWithData<boolean>(payload)) {
      payload = await this.provider[Method.Entries](payload);
    }

    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Entries)) {
      payload = await middleware[Method.Entries](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    if (isPayloadWithData<Record<string, StoredValue>>(payload)) {
      return this.convertBulkData(payload.data, returnBulkType);
    }

    throw this.providerDataFailedError;
  }

  /**
   * Checks every stored value at a path against the given value. Identical behavior to [Array#every](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every).
   * @since 2.0.0
   * @param path The path at which the stored value is at.
   * @param value The primitive value to check against the stored value.
   * @returns A boolean of whether every value matched.
   *
   * @example
   * ```javascript
   * await josh.every('path', 'value'); // true
   * await josh.every(['path'], 'value'); // true
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', { path: 'value' });
   * await josh.set('key2', { path: 'value2' });
   *
   * await josh.every('path', 'value'); // false
   * await josh.every(['path'], 'value'); // false
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', { path: 'value' });
   * await josh.set('key2', { path: 'value' });
   *
   * await josh.every('path', 'value'); // true
   * await josh.evert(['path'], 'value') // true
   * ```
   */
  public async every(path: Path, value: Primitive): Promise<boolean>;

  /**
   * Checks every stored value with a function. Identical Behavior to [Array#every](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every).
   * @since 2.0.0
   * @param hook The hook function to check against stored values.
   * @returns A boolean of whether every hook function returns true.
   *
   * @example
   * ```javascript
   * await josh.every((value) => value === 'value'); // true
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value');
   * await josh.set('key2', 'value2');
   *
   * await josh.every((value) => value === 'value'); // false
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value');
   * await josh.set('key2', 'value');
   *
   * await josh.every((value) => value === 'value'); // true
   * ```
   */
  public async every(hook: Payload.Hook<StoredValue>): Promise<boolean>;
  public async every(pathOrHook: Path | Payload.Hook<StoredValue>, value?: Primitive): Promise<boolean> {
    if (!isFunction(pathOrHook)) {
      if (value === undefined) {
        throw this.error(CommonIdentifiers.MissingValue);
      }

      if (!isPrimitive(value)) {
        throw this.error(CommonIdentifiers.InvalidValueType, { type: 'primitive' });
      }
    }

    let payload: Payload.Every<StoredValue>;

    if (isFunction(pathOrHook)) {
      payload = {
        method: Method.Every,
        errors: [],
        trigger: Trigger.PreProvider,
        type: Payload.Type.Hook,
        hook: pathOrHook
      };
    } else {
      payload = {
        method: Method.Every,
        errors: [],
        trigger: Trigger.PreProvider,
        type: Payload.Type.Value,
        path: this.resolvePath(pathOrHook),
        value
      };
    }

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Every)) {
      payload = await middleware[Method.Every](payload);
    }

    if (!isPayloadWithData<boolean>(payload)) {
      payload = await this.provider[Method.Every](payload);
    }

    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Every)) {
      payload = await middleware[Method.Every](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    if (isPayloadWithData<boolean>(payload)) {
      return payload.data;
    }

    throw this.providerDataFailedError;
  }

  /**
   * Filter stored values using a path and value.
   * @since 2.0.0
   * @param path A path to the value for equality check.
   * @param value The value to check equality.
   * @param returnBulkType The return bulk type. Defaults to {@link Bulk.Object}
   * @returns The bulk data.
   *
   * @example
   * ```javascript
   * await josh.set('key', { path: 'value' });
   *
   * await josh.filter('path', 'value'); // { key: { path: 'value' } }
   * await josh.filter(['path'], 'value', Bulk.OneDimensionalArray); // [{ path: 'value' }]
   * ```
   */
  public async filter<BulkType extends keyof ReturnBulk<StoredValue>>(
    path: Path,
    value: Primitive,
    returnBulkType?: BulkType
  ): Promise<ReturnBulk<StoredValue>[BulkType]>;

  /**
   * Filter stored data using a hook function.
   * @since 2.0.0
   * @param hook The hook function to check equality.
   * @param returnBulkType The return bulk type. Defaults to {@link Bulk.Object}
   * @returns The bulk data.
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value');
   *
   * await josh.filter((value) => value === 'value'); // { key: { path: 'value' } }
   * await josh.filter((value) => value === 'value', Bulk.TwoDimensionalArray); // [['key', 'value']]
   * ```
   */
  public async filter<BulkType extends keyof ReturnBulk<StoredValue>>(
    hook: Payload.Hook<StoredValue>,
    returnBulkType?: BulkType
  ): Promise<ReturnBulk<StoredValue>[BulkType]>;

  public async filter<BulkType extends keyof ReturnBulk<StoredValue>>(
    pathOrHook: Path | Payload.Hook<StoredValue>,
    value?: Primitive,
    returnBulkType?: BulkType
  ): Promise<ReturnBulk<StoredValue>[BulkType]> {
    if (!isFunction(pathOrHook)) {
      if (value === undefined) {
        throw this.error(CommonIdentifiers.MissingValue);
      }

      if (!isPrimitive(value)) {
        throw this.error(CommonIdentifiers.InvalidValueType, { type: 'primitive' });
      }
    }

    let payload: Payload.Filter<StoredValue>;

    if (isFunction(pathOrHook)) {
      payload = {
        method: Method.Filter,
        errors: [],
        trigger: Trigger.PreProvider,
        type: Payload.Type.Hook,
        hook: pathOrHook
      };
    } else {
      payload = {
        method: Method.Filter,
        errors: [],
        trigger: Trigger.PreProvider,
        type: Payload.Type.Value,
        path: this.resolvePath(pathOrHook),
        value
      };
    }

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Filter)) {
      payload = await middleware[Method.Filter](payload);
    }

    if (!isPayloadWithData<boolean>(payload)) {
      payload = await this.provider[Method.Filter](payload);
    }

    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Filter)) {
      payload = await middleware[Method.Filter](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    if (isPayloadWithData<Record<string, StoredValue>>(payload)) {
      return this.convertBulkData(payload.data, returnBulkType);
    }

    throw this.providerDataFailedError;
  }

  /**
   * Find a stored value using a path and value.
   * @since 2.0.0
   * @param path A path to the value for equality check.
   * @param value The value to check equality.
   * @returns The found key/value pair or a null/null pair.
   *
   * @example
   * ```javascript
   * await josh.find('path', 'value'); // null
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', { path: 'value' });
   *
   * await josh.find('path', 'value'); // { path: 'value' }
   * ```
   */
  public async find(path: Path, value: Primitive): Promise<[string, StoredValue] | [null, null]>;

  /**
   * Find a stored value using a hook function.
   * @since 2.0.0
   * @param hook The hook to check equality.
   * @returns The found key/value pair or null/null pair.
   *
   * @example
   * ```javascript
   * await josh.find((value) => value === 'value'); // null
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value');
   *
   * await josh.find((value) => value === 'value'); // 'value'
   * ```
   */
  public async find(hook: Payload.Hook<StoredValue>): Promise<[string, StoredValue] | [null, null]>;
  public async find(pathOrHook: Path | Payload.Hook<StoredValue>, value?: Primitive): Promise<[string, StoredValue] | [null, null]> {
    if (!isFunction(pathOrHook)) {
      if (value === undefined) {
        throw this.error(CommonIdentifiers.MissingValue);
      }

      if (!isPrimitive(value)) {
        throw this.error(CommonIdentifiers.InvalidValueType, { type: 'primitive' });
      }
    }

    let payload: Payload.Find<StoredValue>;

    if (isFunction(pathOrHook)) {
      payload = {
        method: Method.Find,
        errors: [],
        trigger: Trigger.PreProvider,
        type: Payload.Type.Hook,
        hook: pathOrHook
      };
    } else {
      payload = {
        method: Method.Find,
        errors: [],
        trigger: Trigger.PreProvider,
        type: Payload.Type.Value,
        path: this.resolvePath(pathOrHook),
        value
      };
    }

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Find)) {
      payload = await middleware[Method.Find](payload);
    }

    if (!isPayloadWithData<boolean>(payload)) {
      payload = await this.provider[Method.Find](payload);
    }

    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Find)) {
      payload = await middleware[Method.Find](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    if (isPayloadWithData<Record<string, StoredValue>>(payload)) {
      return payload.data;
    }

    throw this.providerDataFailedError;
  }

  /**
   * Get a value using a key.
   * @since 2.0.0
   * @param key A key at which a value is.
   * @returns The value gotten or null.
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value');
   *
   * await josh.get('key'); // 'value'
   * await josh.get('notfound'); // null
   * ```
   */
  public async get(key: string): Promise<StoredValue | null>;

  /**
   * Get a value using a key and/or path.
   * @since 2.0.0
   * @param key A key at which a value is.
   * @param path A path to the value.
   * @returns The value gotten or null.
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value');
   *
   * await josh.get('key'); // 'value'
   *
   * await josh.set('key', { path: 'value' });
   *
   * await josh.get('key'); // { path: 'value' }
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', { path: 'value' });
   *
   * await josh.get('key', 'path'); // 'value'
   * await josh.get('key', ['path']); // 'value'
   * ```
   */
  public async get<Value = StoredValue>(key: string, path?: Path): Promise<Value | null>;
  public async get<Value = StoredValue>(key: string, path: Path = []): Promise<Value | null> {
    path = this.resolvePath(path);

    let payload: Payload.Get<Value> = { method: Method.Get, errors: [], trigger: Trigger.PreProvider, key, path };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Get)) {
      payload = await middleware[Method.Get](payload);
    }

    if (!isPayloadWithData<boolean>(payload)) {
      payload = await this.provider[Method.Get](payload);
    }

    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Get)) {
      payload = await middleware[Method.Get](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    return isPayloadWithData(payload) ? payload.data! : null;
  }

  /**
   * Get stored values at multiple keys.
   * @since 2.0.0
   * @param keys An array of keys to get values from.
   * @param returnBulkType The return bulk type. Defaults to {@link Bulk.Object}
   * @returns The bulk data.
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value');
   *
   * await this.getMany(['key']); // { key: 'value' }
   * await this.getMany(['key'], Bulk.OneDimensionalArray); // ['value']
   * ```
   */
  public async getMany<BulkType extends keyof ReturnBulk<StoredValue | null>>(
    keys: string[],
    returnBulkType?: BulkType
  ): Promise<ReturnBulk<StoredValue | null>[BulkType]> {
    let payload: Payload.GetMany<StoredValue> = { method: Method.GetMany, errors: [], trigger: Trigger.PreProvider, keys };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.GetMany)) {
      payload = await middleware[Method.GetMany](payload);
    }

    if (!isPayloadWithData<boolean>(payload)) {
      payload = await this.provider[Method.GetMany](payload);
    }

    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.GetMany)) {
      payload = await middleware[Method.GetMany](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    if (isPayloadWithData<Record<string, StoredValue | null>>(payload)) {
      return this.convertBulkData(payload.data, returnBulkType);
    }

    throw this.providerDataFailedError;
  }

  /**
   * Check if a key and/or path exists.
   * @since 2.0.0
   * @param key A key to the value to check for.
   * @param path A path to the value to check for.
   * @returns Whether the value exists.
   *
   * @example
   * ```javascript
   * await josh.has('key'); // false
   *
   * await josh.set('key', 'value');
   *
   * await josh.has('key'); // true
   * ```
   *
   * @example
   * ```javascript
   * await josh.has('key', 'path'); // false
   * await josh.has('key', ['path']); // false
   *
   * await josh.set('key', { path: 'value' });
   *
   * await josh.has('key', 'path'); // true
   * await josh.has('key', ['path']); // true
   * ```
   */
  public async has(key: string, path: Path = []): Promise<boolean> {
    path = this.resolvePath(path);

    let payload: Payload.Has = { method: Method.Has, errors: [], trigger: Trigger.PreProvider, key, path };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Has)) {
      payload = await middleware[Method.Has](payload);
    }

    if (!isPayloadWithData<boolean>(payload)) {
      payload = await this.provider[Method.Has](payload);
    }

    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Has)) {
      payload = await middleware[Method.Has](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    if (isPayloadWithData<boolean>(payload)) {
      return payload.data;
    }

    throw this.providerDataFailedError;
  }

  /**
   * Increment an integer by `1`.
   * @since 2.0.0
   * @param key The key to an integer value for incrementing.
   * @param path The path to an integer value for incrementing.
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * await josh.set('key', 0);
   *
   * await josh.inc('key');
   *
   * await josh.get('key'); // 1
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', 0, 'path');
   *
   * await josh.inc('key', 'path');
   *
   * await josh.get('key', 'path'); // 1
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', 0, 'path');
   *
   * await josh.inc('key', ['path']);
   *
   * await josh.get('key', 'path'); // 1
   * ```
   */
  public async inc(key: string, path: Path = []): Promise<this> {
    path = this.resolvePath(path);

    let payload: Payload.Inc = { method: Method.Inc, errors: [], trigger: Trigger.PreProvider, key, path };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Inc)) {
      payload = await middleware[Method.Inc](payload);
    }

    payload = await this.provider[Method.Inc](payload);
    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Inc)) {
      payload = await middleware[Method.Inc](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    return this;
  }

  /**
   * Returns all stored keys.
   * @since 2.0.0
   * @returns The array of stored keys.
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value');
   *
   * await josh.keys(); // ['key']
   * ```
   */
  public async keys(): Promise<string[]> {
    let payload: Payload.Keys = { method: Method.Keys, errors: [], trigger: Trigger.PreProvider };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Keys)) {
      payload = await middleware[Method.Keys](payload);
    }

    if (!isPayloadWithData<boolean>(payload)) {
      payload = await this.provider[Method.Keys](payload);
    }

    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Keys)) {
      payload = await middleware[Method.Keys](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    if (isPayloadWithData<string[]>(payload)) {
      return payload.data;
    }

    throw this.providerDataFailedError;
  }

  /**
   * Map stored values by path or hook function.
   * @since 2.0.0
   * @param pathOrHook The path or hook to map by.
   * @returns The mapped values.
   *
   * @example
   * ```javascript
   * await josh.set('key', { path: 'value' });
   *
   * await josh.map('path'); // ['value']
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', { path: 'value' });
   *
   * await josh.map(['path']); // 'value'
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value');
   *
   * await josh.map((value) => value.toUpperCase()); // ['VALUE']
   * ```
   * @example
   * ```typescript
   * // TypeScript example
   * await josh.set('key', { path: 'value' });
   *
   * await josh.map<string>((value) => value.path); // ['value']
   * ```
   */
  public async map<Value = StoredValue>(pathOrHook: Path | Payload.Hook<StoredValue, Value>): Promise<Value[]> {
    let payload: Payload.Map<StoredValue, Value>;

    if (isFunction(pathOrHook)) {
      payload = {
        method: Method.Map,
        errors: [],
        trigger: Trigger.PreProvider,
        type: Payload.Type.Hook,
        hook: pathOrHook
      };
    } else {
      payload = {
        method: Method.Map,
        errors: [],
        trigger: Trigger.PreProvider,
        type: Payload.Type.Path,
        path: this.resolvePath(pathOrHook)
      };
    }

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Map)) {
      payload = await middleware[Method.Map](payload);
    }

    if (!isPayloadWithData<boolean>(payload)) {
      payload = await this.provider[Method.Map](payload);
    }

    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Map)) {
      payload = await middleware[Method.Map](payload);
    }

    if (payload.errors.length) {
      const { behaviorOnPayloadError } = this.options;

      if (behaviorOnPayloadError !== undefined && behaviorOnPayloadError >= Josh.ErrorBehavior.Log) {
        if (payload.errors.length === 1 && behaviorOnPayloadError === Josh.ErrorBehavior.Throw) {
          throw payload.errors[0];
        } else {
          for (const error of payload.errors) {
            console.error(error);
          }

          if (behaviorOnPayloadError === Josh.ErrorBehavior.Throw) {
            throw this.error({ identifier: Josh.Identifiers.MultipleError, errors: payload.errors });
          }
        }
      }
    }

    if (isPayloadWithData<Value[]>(payload)) {
      return payload.data;
    }

    throw this.providerDataFailedError;
  }

  /**
   * Executes math operations on a value with an operand at a specified key and/or path.
   * @since 2.0.0
   * @param key The key the value is at.
   * @param operator The operator that will be used on the operand and value.
   * @param operand The operand to apply to the value.
   * @param path The path to the value.
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * await josh.set('key', 0);
   *
   * await josh.math('key', MathOperator.Addition, 1);
   *
   * await josh.get('key'); // 1
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', 1);
   *
   * await josh.math('key', MathOperator.Subtraction, 1);
   *
   * await josh.get('key'); // 0
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', 1);
   *
   * await josh.math('key', MathOperator.Multiplication, 2);
   *
   * await josh.get('key'); // 2
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', 2);
   *
   * await josh.math('key' MathOperator.Division, 2);
   *
   * await josh.get('key'); // 1
   * ```
   */
  public async math(key: string, operator: MathOperator, operand: number, path: Path = []): Promise<this> {
    path = this.resolvePath(path);

    let payload: Payload.Math = { method: Method.Math, errors: [], trigger: Trigger.PreProvider, key, path, operator, operand };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Math)) {
      payload = await middleware[Method.Math](payload);
    }

    payload = await this.provider[Method.Math](payload);
    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Math)) {
      payload = await middleware[Method.Math](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    return this;
  }

  /**
   * Filter stored values and get both truthy and falsy results.
   * @since 2.0.0
   * @param hook The hook function to check equality.
   * @param _value Unused.
   * @param returnBulkType The return bulk type, Defaults to {@link Bulk.Object}
   * @returns A partition of filtered bulk data. First bulk data is the truthy filter and the second bulk data is the falsy filter.
   *
   * @example
   * ```javascript
   * await josh.set('key', undefined, true);
   * await josh.set('key2', undefined, false);
   *
   * await josh.partition((value) => value); // [{ key: true }, { key2: false }]
   * ```
   */
  public async partition<BulkType extends keyof ReturnBulk<StoredValue>>(
    hook: Payload.Hook<StoredValue>,
    _value: null,
    returnBulkType?: BulkType
  ): Promise<[ReturnBulk<StoredValue>[BulkType], ReturnBulk<StoredValue>[BulkType]]>;

  /**
   * Filter stored values and get both truthy and falsy results.
   * @since 2.0.0
   * @param path A path to the value for equality check.
   * @param value The value to check equality.
   * @param returnBulkType The return bulk type. Defaults to {@link Bulk.Object}
   * @returns A partition of filtered bulk data. First bulk data is the truthy filter and the second bulk data is the falsy filter.
   *
   * @example
   * ```javascript
   * await josh.set('key', { path: true });
   * await josh.set('key2', { path: false });
   *
   * await josh.partition('path', true); // [{ key: true }, { key2: false }]
   * ```
   */
  public async partition<BulkType extends keyof ReturnBulk<StoredValue>>(
    path: Path,
    value: Primitive,
    returnBulkType?: BulkType
  ): Promise<[ReturnBulk<StoredValue>[BulkType], ReturnBulk<StoredValue>[BulkType]]>;

  public async partition<BulkType extends keyof ReturnBulk<StoredValue>>(
    pathOrHook: Path | Payload.Hook<StoredValue>,
    value?: Primitive,
    returnBulkType?: BulkType
  ): Promise<[ReturnBulk<StoredValue>[BulkType], ReturnBulk<StoredValue>[BulkType]]> {
    if (!isFunction(pathOrHook)) {
      if (value === undefined) {
        throw this.error(CommonIdentifiers.MissingValue);
      }

      if (!isPrimitive(value)) {
        throw this.error(CommonIdentifiers.InvalidValueType, { type: 'primitive' });
      }
    }

    let payload: Payload.Partition<StoredValue>;

    if (isFunction(pathOrHook)) {
      payload = {
        method: Method.Partition,
        errors: [],
        trigger: Trigger.PreProvider,
        type: Payload.Type.Hook,
        hook: pathOrHook
      };
    } else {
      payload = {
        method: Method.Partition,
        errors: [],
        trigger: Trigger.PreProvider,
        type: Payload.Type.Value,
        path: this.resolvePath(pathOrHook),
        value
      };
    }

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Partition)) {
      payload = await middleware[Method.Partition](payload);
    }

    if (!isPayloadWithData<boolean>(payload)) {
      payload = await this.provider[Method.Partition](payload);
    }

    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Partition)) {
      payload = await middleware[Method.Partition](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    if (isPayloadWithData<Payload.Partition.Data<StoredValue>>(payload)) {
      const { truthy, falsy } = payload.data;

      return [this.convertBulkData(truthy, returnBulkType), this.convertBulkData(falsy, returnBulkType)];
    }

    throw this.providerDataFailedError;
  }

  /**
   * Push a value to an array.
   * @since 2.0.0
   * @param key A key to the array.
   * @param value The value to push.
   * @param path A path to the array.
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * await josh.set('key', []);
   *
   * await josh.push('key', 'value');
   *
   * await josh.get('key'); // ['value']
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', { path: [] });
   *
   * await josh.push('key', 'firstValue', 'path');
   * await josh.push('key', 'secondValue', ['path']);
   *
   * await josh.get('key', 'path'); // ['firstValue', 'secondValue']
   * ```
   */
  public async push<Value = StoredValue>(key: string, value: Value, path: Path = []): Promise<this> {
    path = this.resolvePath(path);

    let payload: Payload.Push<Value> = { method: Method.Push, errors: [], trigger: Trigger.PreProvider, key, path, value };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Push)) {
      payload = await middleware[Method.Push](payload);
    }

    payload = await this.provider[Method.Push](payload);
    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Push)) {
      payload = await middleware[Method.Push](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    return this;
  }

  /**
   * Gets random value(s).
   * @param options The options for getting random values.
   * @returns The random value(s) or null.
   *
   * @example
   * ```javascript
   * await josh.random(); // null
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value');
   *
   * await josh.random(); // ['value']
   * ```
   */
  public async random(options?: Josh.RandomOptions): Promise<StoredValue[] | null> {
    const { count = 1, unique = false } = options ?? {};
    let payload: Payload.Random<StoredValue> = { method: Method.Random, errors: [], trigger: Trigger.PreProvider, count, unique };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Random)) {
      payload = await middleware[Method.Random](payload);
    }

    if (!isPayloadWithData<boolean>(payload)) {
      payload = await this.provider[Method.Random](payload);
    }

    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Random)) {
      payload = await middleware[Method.Random](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    if (isPayloadWithData<StoredValue[]>(payload)) {
      return payload.data.length ? payload.data : null;
    }

    throw this.providerDataFailedError;
  }

  /**
   * Get a random key.
   *
   * NOTE: `options.duplicates` only makes checks on primitive value types.
   * @since 2.0.0
   * @returns The random key or `null`.
   *
   * @example
   * ```javascript
   * await josh.randomKey(); // null
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value');
   *
   * await josh.randomKey(); // ['key']
   * ```
   */
  public async randomKey(options?: Josh.RandomOptions): Promise<string[] | null> {
    const { count = 1, unique = false } = options ?? {};
    let payload: Payload.RandomKey = { method: Method.RandomKey, errors: [], trigger: Trigger.PreProvider, count, unique };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.RandomKey)) {
      payload = await middleware[Method.RandomKey](payload);
    }

    if (!isPayloadWithData<boolean>(payload)) {
      payload = await this.provider[Method.RandomKey](payload);
    }

    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.RandomKey)) {
      payload = await middleware[Method.RandomKey](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    if (isPayloadWithData<string[]>(payload)) {
      return payload.data.length ? payload.data : null;
    }

    throw this.providerDataFailedError;
  }

  /**
   * Removes an element from an array at a key and/or path that matches the given value.
   * @since 2.0.0
   * @param key The key and/or path to the array to remove an element.
   * @param value The value to match to an element in the array.
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * await josh.set('key', ['value']);
   *
   * await josh.remove('key', 'value');
   *
   * await josh.get('key'); // []
   * ```
   */
  public async remove(key: string, value: Primitive, path?: Path): Promise<this>;

  /**
   * Removes an element from an array at a key and/or path that are validated by a hook function.
   * @since 2.0.0
   * @param key The key and/or path to the array to remove an element.
   * @param hook The hook function to validate elements in the array.
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * await josh.set('key', ['value']);
   *
   * await josh.remove('key', (value) => value === 'value');
   *
   * await josh.get('key'); // []
   * ```
   */
  public async remove<Value = StoredValue>(key: string, hook: Payload.Hook<Value, boolean>, path?: Path): Promise<this>;
  public async remove<Value = StoredValue>(key: string, valueOrHook: Primitive | Payload.Hook<Value, boolean>, path: Path = []): Promise<this> {
    path = this.resolvePath(path);

    if (!isFunction(valueOrHook)) {
      if (!isPrimitive(valueOrHook)) {
        throw this.error(CommonIdentifiers.InvalidValueType, { type: 'primitive' });
      }
    }

    let payload: Payload.Remove<Value>;

    if (isFunction(valueOrHook)) {
      payload = {
        method: Method.Remove,
        errors: [],
        trigger: Trigger.PreProvider,
        type: Payload.Type.Hook,
        key,
        path,
        hook: valueOrHook
      };
    } else {
      payload = {
        method: Method.Remove,
        errors: [],
        trigger: Trigger.PreProvider,
        type: Payload.Type.Value,
        key,
        path,
        value: valueOrHook
      };
    }

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Remove)) {
      payload = await middleware[Method.Remove](payload);
    }

    payload = await this.provider[Method.Remove](payload);
    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Remove)) {
      payload = await middleware[Method.Remove](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    return this;
  }

  /**
   * Sets a value using a key and/or path.
   * @since 2.0.0
   * @param key The key to set the value to.
   * @param value The value to set at the key and/or path.
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * await josh.set('key', { path: 'value' });
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value', 'path');
   * await josh.set('key', 'value', ['path']);
   * ```
   */
  public async set<Value = StoredValue>(key: string, value: Value, path: Path = []): Promise<this> {
    path = this.resolvePath(path);

    let payload: Payload.Set<Value> = { method: Method.Set, errors: [], trigger: Trigger.PreProvider, key, path, value };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Set)) {
      payload = await middleware[Method.Set](payload);
    }

    payload = await this.provider[Method.Set](payload);
    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Set)) {
      payload = await middleware[Method.Set](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    return this;
  }

  /**
   * Sets multiple keys and/or paths to their respective values.
   * @since 2.0.0
   * @param entries The entries of key/path/value to set.
   * @param overwrite Whether to overwrite existing values (default true).
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * await josh.setMany([
   *   ['key', 'value'],
   * ]);
   * await josh.setMany([
   *   ['key', { path: 'value' }],
   * ]);
   * await josh.setMany([
   *   [{ key: 'key', path: 'path' }, 'value'],
   * ]);
   * ```
   */
  public async setMany(entries: [KeyPath, unknown][], overwrite = true): Promise<this> {
    let payload: Payload.SetMany = {
      method: Method.SetMany,
      errors: [],
      trigger: Trigger.PreProvider,
      entries: entries.map(([keyPath, value]) => {
        const [key, path] = this.resolveKeyPath(keyPath);

        return { key, path: this.resolvePath(path), value };
      }),
      overwrite
    };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.SetMany)) {
      payload = await middleware[Method.SetMany](payload);
    }

    payload = await this.provider[Method.SetMany](payload);
    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.SetMany)) {
      payload = await middleware[Method.SetMany](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    return this;
  }

  /**
   * Get the amount of key/values
   * @since 2.0.0
   * @returns The number amount.
   *
   * @example
   * ```javascript
   * await josh.size(); // 0
   * ```
   */
  public async size(): Promise<number> {
    let payload: Payload.Size = { method: Method.Size, errors: [], trigger: Trigger.PreProvider };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Size)) {
      payload = await middleware[Method.Size](payload);
    }

    if (!isPayloadWithData<boolean>(payload)) {
      payload = await this.provider[Method.Size](payload);
    }

    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Size)) {
      payload = await middleware[Method.Size](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    if (isPayloadWithData<number>(payload)) {
      return payload.data;
    }

    throw this.providerDataFailedError;
  }

  /**
   * Verify if a path's value matches a value.
   * @since 2.0.0
   * @param path A path to the value for equality check.
   * @param value The value to check equality.
   *
   * @example
   * ```javascript
   * await josh.some('path', 'value'); // false
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value', 'path');
   *
   * await josh.some('path', 'value'); // true
   * ```
   *
   */
  public async some(path: Path, value: Primitive): Promise<boolean>;

  /**
   * Verify if a stored value matches with a hook function,
   * @since 2.0.0
   * @param hook The hook to check equality.
   *
   * @example
   * ```javascript
   * await josh.some((value) => value === 'value'); // false
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value', 'path');
   *
   * await josh.some('path', 'value'); // true
   * ```
   */
  public async some(hook: Payload.Hook<StoredValue, boolean>): Promise<boolean>;
  public async some(pathOrHook: Path | Payload.Hook<StoredValue, boolean>, value?: Primitive): Promise<boolean> {
    if (!isFunction(pathOrHook)) {
      if (value === undefined) {
        throw this.error(CommonIdentifiers.MissingValue);
      }

      if (!isPrimitive(value)) {
        throw this.error(CommonIdentifiers.InvalidValueType, { type: 'primitive' });
      }
    }

    let payload: Payload.Some<StoredValue>;

    if (isFunction(pathOrHook)) {
      payload = {
        method: Method.Some,
        errors: [],
        trigger: Trigger.PreProvider,
        type: Payload.Type.Hook,
        hook: pathOrHook
      };
    } else {
      payload = {
        method: Method.Some,
        errors: [],
        trigger: Trigger.PreProvider,
        type: Payload.Type.Value,
        path: this.resolvePath(pathOrHook),
        value
      };
    }

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Some)) {
      payload = await middleware[Method.Some](payload);
    }

    if (!isPayloadWithData<boolean>(payload)) {
      payload = await this.provider[Method.Some](payload);
    }

    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Some)) {
      payload = await middleware[Method.Some](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    if (isPayloadWithData<boolean>(payload)) {
      return payload.data;
    }

    throw this.providerDataFailedError;
  }

  /**
   * Update a stored value using a hook function.
   * @since 2.0.0
   * @param key The key to the stored value for updating.
   * @param hook The hook to update the stored value.
   * @returns The updated value or null.
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value');
   *
   * await josh.update('key', (value) => value.toUpperCase()); // 'VALUE'
   * ```
   */
  public async update<Value = StoredValue>(key: string, hook: Payload.Hook<StoredValue, Value>): Promise<this> {
    let payload: Payload.Update<StoredValue, Value> = { method: Method.Update, errors: [], trigger: Trigger.PreProvider, key, hook };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Update)) {
      payload = await middleware[Method.Update](payload);
    }

    payload = await this.provider[Method.Update](payload);
    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Update)) {
      payload = await middleware[Method.Update](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    return this;
  }

  /**
   * Get all stored values.
   * @since 2.0.0
   * @returns An array of stored values.
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value');
   * await josh.set('anotherKey', 'anotherValue');
   *
   * await josh.values(); // ['value', 'anotherValue']
   * ```
   */
  public async values(): Promise<StoredValue[]> {
    let payload: Payload.Values<StoredValue> = { method: Method.Values, errors: [], trigger: Trigger.PreProvider };

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPreMiddlewares(Method.Values)) {
      payload = await middleware[Method.Values](payload);
    }

    if (!isPayloadWithData<boolean>(payload)) {
      payload = await this.provider[Method.Values](payload);
    }

    payload.trigger = Trigger.PostProvider;

    for (const middleware of Array.from(this.middlewares.values())) {
      await middleware.run(payload);
    }

    for (const middleware of this.middlewares.getPostMiddlewares(Method.Values)) {
      payload = await middleware[Method.Values](payload);
    }

    this.runBehaviorOnPayloadError(payload);

    if (isPayloadWithData<StoredValue[]>(payload)) {
      return payload.data;
    }

    throw this.providerDataFailedError;
  }

  /**
   * Import exported data to json
   * @since 2.0.0
   * @param options The options to import data.
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * const { readFileSync } = require('fs');
   *
   * const json = JSON.parse(readFileSync("./export.json"))
   * await josh.import({ json });
   * ```
   */
  public async import(options: Josh.ImportOptions<StoredValue>): Promise<this> {
    let { json, overwrite, clear } = options;

    if (this.isLegacyExportJSON(json)) {
      process.emitWarning(this.error(Josh.Identifiers.LegacyDeprecation).message);
      json = this.convertLegacyExportJSON(json);
    }

    if (clear) {
      await this.provider[Method.Clear]({ method: Method.Clear, errors: [] });
    }

    await this.provider[Method.SetMany]({
      method: Method.SetMany,
      errors: [],
      entries: json.entries.map(([key, value]) => ({ key, path: [], value })),
      overwrite: overwrite ?? false
    });

    return this;
  }

  /**
   * Exports all data from the provider.
   * @since 2.0.0
   * @returns The exported data json object.
   *
   * @example
   * ```javascript
   * const { writeFileSync } = require('fs');
   *
   * const json = await josh.export();
   * writeFileSync("./export.json", JSON.stringify(json));
   * ```
   */
  public async export(): Promise<Josh.ExportJSON<StoredValue>> {
    return {
      name: this.name,
      version: Josh.version,
      exportedTimestamp: Date.now(),
      entries: await this.entries(Bulk.TwoDimensionalArray)
    };
  }

  /**
   * Convert bulk data.
   * @since 2.0.0
   * @private
   * @param data The data to convert.
   * @param returnBulkType The return bulk type. Defaults to {@link Josh.Options.defaultBulkType} or {@link Bulk.Object}
   * @returns The bulk data.
   */
  private convertBulkData<Value = StoredValue, K extends keyof ReturnBulk<Value> = Bulk.Object>(
    data: ReturnBulk<Value>[Bulk.Object],
    returnBulkType?: K
  ): ReturnBulk<Value>[K] {
    const { defaultBulkType } = this.options;

    switch (returnBulkType ?? defaultBulkType) {
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

  private runBehaviorOnPayloadError(payload: Payload): void {
    if (payload.errors.length) {
      const { behaviorOnPayloadError } = this.options;

      if (behaviorOnPayloadError !== undefined && behaviorOnPayloadError >= Josh.ErrorBehavior.Log) {
        if (payload.errors.length === 1 && behaviorOnPayloadError === Josh.ErrorBehavior.Throw) {
          throw payload.errors[0];
        } else {
          for (const error of payload.errors) {
            console.error(error);
          }

          if (behaviorOnPayloadError === Josh.ErrorBehavior.Throw) {
            throw this.error({ identifier: Josh.Identifiers.MultipleError, errors: payload.errors });
          }
        }
      }
    }
  }

  /**
   * Resolves an identifier or options to an error.
   * @since 2.0.0
   * @param options The options for resolving the error.
   * @param metadata The metadata for the error.
   * @returns The resolved error.
   */
  private error(options: string | JoshErrorOptions, metadata: Record<string, unknown> = {}): JoshError {
    if (typeof options === 'string') {
      return new JoshError({ identifier: options, errors: [], message: this.resolveIdentifier(options, metadata) });
    }

    if ('message' in options) {
      return new JoshError(options);
    }

    return new JoshError({ ...options, message: this.resolveIdentifier(options.identifier, metadata) });
  }

  /**
   * Convert a legacy export json object to a new export json object.
   * @param json
   * @returns
   */
  private convertLegacyExportJSON<StoredValue>(json: Josh.LegacyExportJSON<StoredValue>): Josh.ExportJSON<StoredValue> {
    const { name, version, exportDate, keys } = json;

    return { name, version, exportedTimestamp: exportDate, entries: keys.map<[string, StoredValue]>(({ key, value }) => [key, value]) };
  }

  /**
   * Check if a json object is a legacy export json object.
   * @param json The json object to check.
   * @returns Whether the json object is a legacy export json object.
   */
  private isLegacyExportJSON<StoredValue>(
    json: Josh.ExportJSON<StoredValue> | Josh.LegacyExportJSON<StoredValue>
  ): json is Josh.LegacyExportJSON<StoredValue> {
    return 'exportDate' in json && 'keys' in json;
  }

  /**
   * Resolve an identifier.
   * @param identifier The identifier to resolve.
   * @param metadata The metadata for the identifier.
   * @returns The resolved identifier.
   */
  private resolveIdentifier(identifier: string, metadata: Record<string, unknown> = {}): string {
    const result = resolveCommonIdentifier(identifier, metadata);

    if (result !== null) {
      return result;
    }

    switch (identifier) {
      case Josh.Identifiers.InvalidMiddleware:
        return 'The middleware must extend the exported "Middleware" class.';

      case Josh.Identifiers.InvalidProvider:
        return 'The "provider" option must extend the exported "JoshProvider" class to ensure compatibility, but continuing anyway.';

      case Josh.Identifiers.LegacyDeprecation:
        return 'You have imported data from a deprecated legacy format. This will be removed in the next semver major version.';

      case Josh.Identifiers.MissingName:
        return 'The "name" option is required to initiate a Josh instance.';

      case Josh.Identifiers.MultipleError:
        return 'Josh has encountered multiple errors. Please check the "errors" property of this error.';

      case Josh.Identifiers.ProviderDataFailed:
        return 'The provider failed to return data.';

      case Josh.Identifiers.UseMiddlewareHookNotFound:
        return 'The "hook" parameter for middleware was not found.';
    }

    throw new Error(`Unknown identifier: ${identifier}`);
  }

  /**
   * Resolves a key and/or path for universal use.
   * @param keyPath The key or path to resolve.
   * @returns The resolved key and path.
   */
  private resolveKeyPath(keyPath: KeyPath): [string, string[]] {
    if (typeof keyPath === 'object') {
      return [keyPath.key, this.resolvePath(keyPath.path ?? [])];
    }

    const [key, ...path] = keyPath.split('.');

    return [key, path];
  }

  /**
   * Resolves a path for universal use.
   * @param path The path to resolve.
   * @returns The resolved path.
   */
  private resolvePath(path: Path): string[] {
    return Array.isArray(path) ? path : path.replace(/\[/g, '.').replace(/\]/g, '').split('.').filter(Boolean);
  }

  /**
   * The current version of {@link Josh}
   * @since 2.0.0
   */
  public static version = '[VI]{{inject}}[/VI]';

  /**
   * A static method to create multiple instances of {@link Josh}.
   * @since 2.0.0
   * @param names The names to give each instance of {@link Josh}
   * @param options The options to give all the instances.
   * @returns The created instances.
   */
  public static multi<Instances extends Record<string, Josh> = Record<string, Josh>>(
    names: string[],
    options: Omit<Josh.Options, 'name'> = {}
  ): Instances {
    // @ts-expect-error 2345
    return names.reduce<Instances>((instances, name) => ({ ...instances, [name]: new Josh({ ...options, name }) }), {});
  }
}

export namespace Josh {
  /**
   * The options for {@link Josh}.
   * @since 2.0.0
   */
  export interface Options<StoredValue = unknown> {
    /**
     * The name for the Josh instance.
     * @since 2.0.0
     */
    name?: string;

    /**
     * The provider instance.
     * @since 2.0.0
     */
    provider?: JoshProvider<StoredValue>;

    /**
     * The middleware to use.
     * @since 2.0.0
     */
    middlewares?: JoshMiddleware<NonNullObject, StoredValue>[];

    /**
     * The context data for the auto-ensure middleware
     * @since 2.0.0
     */
    autoEnsure?: AutoEnsureMiddleware.ContextData<StoredValue>;

    /**
     * The behavior when encountering errors.
     * @since 2.0.0
     */
    behaviorOnPayloadError?: ErrorBehavior;

    /**
     * The default bulk type to return in bulk supported methods.
     * @since 2.0.0
     */
    defaultBulkType?: Bulk;
  }

  /**
   * The options for the {@link Josh.use} method.
   * @since 2.0.0
   */
  export interface UseMiddlewareOptions {
    /**
     * The name for the middleware.
     * @since 2.0.0
     */
    name: string;

    /**
     * The position for the middleware.
     * @since 2.0.0
     */
    position?: number;

    /**
     * The trigger for the middleware hook.
     * @since 2.0.0
     */
    trigger?: Trigger;

    /**
     * The trigger for the middleware hook.
     * @since 2.0.0
     */
    method?: Method;
  }

  export interface ExportJSON<StoredValue = unknown> {
    /**
     * The name of exported data.
     * @since 2.0.0
     */
    name: string;

    /**
     * The version of Josh used to export the data.
     * @since 2.0.0
     */
    version: string;

    /**
     * The timestamp of when the data was exported.
     * @since 2.0.0
     */
    exportedTimestamp: number;

    /**
     * The exported data entries.
     * @since 2.0.0
     */
    entries: [string, StoredValue][];
  }

  export interface LegacyExportJSON<StoredValue = unknown> {
    /**
     * The name of exported data.
     * @since 2.0.0
     */
    name: string;

    /**
     * The version of Josh or Enmap used to export the data.
     * @since 2.0.0
     */
    version: string;

    /**
     * The timestamp of when the data was exported.
     * @since 2.0.0
     */
    exportDate: number;

    /**
     * The exported data.
     * @since 2.0.0
     */
    keys: { key: string; value: StoredValue }[];
  }

  export interface ImportOptions<StoredValue = unknown> {
    /**
     * The data to import.
     * @since 2.0.0
     */
    json: ExportJSON<StoredValue> | LegacyExportJSON<StoredValue>;

    /**
     * Whether to overwrite existing data.
     * @since 2.0.0
     */
    overwrite?: boolean;

    /**
     * Whether to clear all data before importing.
     * @since 2.0.0
     */
    clear?: boolean;
  }
  export interface SetManyOptions<Value = unknown> extends KeyPathJSON {
    /**
     * The value to set.
     * @since 2.0.0
     */
    value: Value;
  }

  export interface RandomOptions {
    /**
     * The amount of values to get.
     * @since 2.0.0
     */
    count?: number;

    /**
     * Whether the values should be unique.
     * @since 2.0.0
     */
    unique?: boolean;
  }

  export enum ErrorBehavior {
    None,

    Log,

    Throw
  }

  export enum Identifiers {
    InvalidMiddleware = 'InvalidMiddleware',

    InvalidProvider = 'invalidProvider',

    LegacyDeprecation = 'legacyDeprecation',

    MissingName = 'missingName',

    MultipleError = 'multipleError',

    ProviderDataFailed = 'providerDataFailed',

    UseMiddlewareHookNotFound = 'useMiddlewareHookNotFound'
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
