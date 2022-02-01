import { Awaitable, isFunction, isPrimitive, Primitive } from '@sapphire/utilities';
import { writeFile } from 'fs/promises';
import { emitWarning } from 'process';
import type { CoreAutoEnsure } from '../../middlewares/CoreAutoEnsure';
import { JoshError } from '../errors';
import { convertLegacyExportJSON, isNodeEnvironment } from '../functions';
import { isLegacyExportJSON } from '../functions/validators';
import {
  AutoKeyPayload,
  ClearPayload,
  DecPayload,
  DeletePayload,
  EnsurePayload,
  EveryHook,
  EveryPayload,
  FilterHook,
  FilterPayload,
  FindHook,
  FindPayload,
  GetAllPayload,
  GetManyPayload,
  GetPayload,
  HasPayload,
  IncPayload,
  KeysPayload,
  MapHook,
  MapPayload,
  MathPayload,
  PartitionHook,
  PartitionPayload,
  Payload,
  PushPayload,
  RandomKeyPayload,
  RandomPayload,
  RemoveHook,
  RemovePayload,
  SetManyPayload,
  SetPayload,
  SizePayload,
  SomeHook,
  SomePayload,
  UpdateHook,
  UpdatePayload,
  ValuesPayload
} from '../payloads';
import { BuiltInMiddleware, KeyPath, KeyPathJSON, MathOperator, Method, Path, StringArray, Trigger } from '../types';
import { MapProvider } from './default-provider';
import { JoshProvider } from './JoshProvider';
import { Middleware } from './Middleware';
import { MiddlewareStore } from './MiddlewareStore';

/**
 * The base class that makes Josh work.
 * @see {@link Josh.Options} for all options available to the Josh class.
 * @since 2.0.0
 *
 * @example
 * ```javascript
 * const josh = new Josh({
 *   name: 'name',
 *   // More options...
 * });
 * ```
 *
 * @example
 * ```javascript
 * // Using a provider.
 * const josh = new Josh({
 *   name: 'name',
 *   provider: new Provider(),
 *   // More options...
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
   * This Josh's middlewares.
   *
   * NOTE: Do not use this unless you know what your doing.
   * @since 2.0.0
   */
  public middlewares: MiddlewareStore<StoredValue>;

  /**
   * This Josh's provider instance.
   *
   * NOTE: Do not use this unless you know what your doing.
   */
  public provider: JoshProvider<StoredValue>;

  public constructor(options: Josh.Options<StoredValue>) {
    const { name, provider } = options;

    this.options = options;

    if (!name)
      throw new JoshError({ identifier: Josh.Identifiers.MissingName, message: 'The "name" option is required to initiate a Josh instance.' });

    this.name = name;
    this.provider = provider ?? new MapProvider<StoredValue>({});

    if (!(this.provider instanceof JoshProvider))
      throw new JoshError({
        identifier: Josh.Identifiers.InvalidProvider,
        message: 'The "provider" option must extend the exported "JoshProvider" class.'
      });

    this.middlewares = new MiddlewareStore({ instance: this });
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
   */
  public async init(): Promise<this> {
    const context = await this.provider.init({ name: this.name, instance: this });

    if (context.error) throw context.error;

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
   * Adds a middleware by providing a {@link Middleware} instance.
   * @since 2.0.0
   * @param instance The middleware instance.
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * josh.use(new MyMiddleware());
   * ```
   */
  public use(instance: Middleware<StoredValue>): this;
  public use<P extends Payload>(optionsOrInstance: Josh.UseMiddlewareOptions | Middleware<StoredValue>, hook?: (payload: P) => Awaitable<P>): this {
    if (optionsOrInstance instanceof Middleware) this.middlewares.set(optionsOrInstance.name, optionsOrInstance);
    else {
      if (hook === undefined)
        throw new JoshError({
          identifier: Josh.Identifiers.UseMiddlewareHookNotFound,
          message: 'The "hook" parameter for middleware was not found.'
        });

      const { name, position, trigger, method } = optionsOrInstance;
      const options: Middleware.Options = { name, position, conditions: { pre: [], post: [] } };
      const middleware = this.middlewares.get(options.name) ?? new Middleware<StoredValue>(options).init(this.middlewares);

      if (trigger !== undefined && method !== undefined) options.conditions[trigger === Trigger.PreProvider ? 'pre' : 'post'].push(method);

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
    let payload: AutoKeyPayload = { method: Method.AutoKey, trigger: Trigger.PreProvider, data: '' };

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.AutoKey)) payload = await middleware[Method.AutoKey](payload);

    payload = await this.provider[Method.AutoKey](payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.AutoKey)) payload = await middleware[Method.AutoKey](payload);

    return payload.data;
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
    let payload: ClearPayload = { method: Method.Clear, trigger: Trigger.PreProvider };

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Clear)) payload = await middleware[Method.Clear](payload);

    payload = await this.provider[Method.Clear](payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Clear)) payload = await middleware[Method.Clear](payload);

    return this;
  }

  /**
   * Decrement an integer by `1`.
   * @since 2.0.0
   * @param keyPath The key/path to the integer for decrementing.
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * await josh.set('key', 1);
   *
   * await josh.inc('key');
   *
   * await josh.get('key'); // 0
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', 1);
   *
   * await josh.inc({ key: 'key' });
   *
   * await josh.get('key'); // 0
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key.path', 1);
   *
   * await josh.inc('key.path');
   *
   * await josh.get('key.path'); // 0
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key.path', 1);
   *
   * await josh.inc({ key: 'key', path: 'path' });
   *
   * await josh.get('key.path'); // 0
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key.path', 1);
   *
   * await josh.inc({ key: 'key', path: ['path'] });
   *
   * await josh.get('key.path'); // 0
   * ```
   */
  public async dec(keyPath: KeyPath): Promise<this> {
    const [key, path] = this.getKeyPath(keyPath);
    let payload: DecPayload = { method: Method.Dec, trigger: Trigger.PreProvider, key, path };

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Dec)) payload = await middleware[Method.Dec](payload);

    payload = await this.provider[Method.Dec](payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Dec)) payload = await middleware[Method.Dec](payload);

    return this;
  }

  /**
   * Deletes a key or path in a key value.
   * @since 2.0.0
   * @param keyPath The key/path to delete from.
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
   * await josh.set('key', 'value');
   *
   * await josh.delete({ key: 'key' });
   *
   * await josh.get('key'); // null
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', { path: 'value' });
   *
   * await josh.delete('key.path');
   *
   * await josh.get('key'); // {}
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', { path: 'value' });
   *
   * await josh.delete({ key: 'key', path: 'path' });
   *
   * await josh.get('key'); // {}
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', { path: 'value' });
   *
   * await josh.delete({ key: 'key', path: ['path'] });
   *
   * await josh.get('key'); // {}
   * ```
   */
  public async delete(keyPath: KeyPath): Promise<this> {
    const [key, path] = this.getKeyPath(keyPath);
    let payload: DeletePayload = { method: Method.Delete, trigger: Trigger.PreProvider, key, path };

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Delete)) payload = await middleware[Method.Delete](payload);

    payload = await this.provider[Method.Delete](payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Delete)) payload = await middleware[Method.Delete](payload);

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
    let payload: EnsurePayload<StoredValue> = { method: Method.Ensure, trigger: Trigger.PreProvider, key, defaultValue, data: defaultValue };

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Ensure)) payload = await middleware[Method.Ensure](payload);

    payload = await this.provider[Method.Ensure](payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Ensure)) payload = await middleware[Method.Ensure](payload);

    return payload.data;
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
  public async every(hook: EveryHook<StoredValue>): Promise<boolean>;
  public async every(pathOrHook: Path | EveryHook<StoredValue>, value?: Primitive): Promise<boolean> {
    if (!isFunction(pathOrHook)) {
      if (value === undefined)
        throw new JoshError({ identifier: Josh.Identifiers.EveryMissingValue, message: 'The "value" parameter was not found.' });
      if (!isPrimitive(value))
        throw new JoshError({ identifier: Josh.Identifiers.EveryInvalidValue, message: 'The "value" parameter must be a primitive type.' });
    }

    let payload: EveryPayload<StoredValue> = {
      method: Method.Every,
      trigger: Trigger.PreProvider,
      type: isFunction(pathOrHook) ? Payload.Type.Hook : Payload.Type.Value,
      data: true
    };

    if (isFunction(pathOrHook)) payload.hook = pathOrHook;
    else {
      payload.path = this.getPath(pathOrHook);
      payload.value;
    }

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Every)) payload = await middleware[Method.Every](payload);

    payload = await this.provider[Method.Every](payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Every)) payload = await middleware[Method.Every](payload);

    return payload.data;
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
   * @param _value Unused.
   * @param returnBulkType The return bulk type. Defaults to {@link Bulk.Object}
   * @returns The bulk data.
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value');
   *
   * await josh.filter((value) => value === 'value'); // { key: { path: 'value' } }
   * await josh.filter((value) => value === 'value', undefined, Bulk.TwoDimensionalArray); // [['key', 'value']]
   * ```
   */
  public async filter<BulkType extends keyof ReturnBulk<StoredValue>>(
    hook: FilterHook<StoredValue>,
    _value: undefined,
    returnBulkType?: BulkType
  ): Promise<ReturnBulk<StoredValue>[BulkType]>;

  public async filter<BulkType extends keyof ReturnBulk<StoredValue>>(
    pathOrHook: Path | FilterHook<StoredValue>,
    value?: Primitive,
    returnBulkType?: BulkType
  ): Promise<ReturnBulk<StoredValue>[BulkType]> {
    if (!isFunction(pathOrHook)) {
      if (value === undefined)
        throw new JoshError({ identifier: Josh.Identifiers.FilterMissingValue, message: 'The "value" parameter was not found.' });
      if (!isPrimitive(value))
        throw new JoshError({ identifier: Josh.Identifiers.FilterInvalidValue, message: 'The "value" parameter must be a primitive type.' });
    }

    let payload: FilterPayload<StoredValue> = {
      method: Method.Filter,
      trigger: Trigger.PreProvider,
      type: isFunction(pathOrHook) ? Payload.Type.Hook : Payload.Type.Value,
      data: {}
    };

    if (isFunction(pathOrHook)) payload.hook = pathOrHook;
    else {
      payload.path = this.getPath(pathOrHook);
      payload.value = value;
    }

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Filter)) payload = await middleware[Method.Filter](payload);

    payload = await this.provider[Method.Filter](payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Filter)) payload = await middleware[Method.Filter](payload);

    return this.convertBulkData(payload.data, returnBulkType);
  }

  /**
   * Find a stored value using a path and value.
   * @since 2.0.0
   * @param path A path to the value for equality check.
   * @param value The value to check equality.
   * @returns The found value or null.
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
  public async find(path: Path, value: Primitive): Promise<StoredValue | null>;

  /**
   * Find a stored value using a hook function.
   * @since 2.0.0
   * @param hook The hook to check equality.
   * @returns The found value or null.
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
  public async find(hook: FindHook<StoredValue>): Promise<StoredValue | null>;
  public async find(pathOrHook: Path | FindHook<StoredValue>, value?: Primitive): Promise<StoredValue | null> {
    if (!isFunction(pathOrHook)) {
      if (value === undefined)
        throw new JoshError({ identifier: Josh.Identifiers.FindMissingValue, message: 'The "value" parameter was not found.' });
      if (!isPrimitive(value))
        throw new JoshError({ identifier: Josh.Identifiers.FindInvalidValue, message: 'The "value" parameter must be a primitive type.' });
    }

    let payload: FindPayload<StoredValue> = {
      method: Method.Find,
      trigger: Trigger.PreProvider,
      type: isFunction(pathOrHook) ? Payload.Type.Hook : Payload.Type.Value
    };

    if (isFunction(pathOrHook)) payload.hook = pathOrHook;
    else {
      payload.path = this.getPath(pathOrHook);
      payload.value = value;
    }

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Find)) payload = await middleware[Method.Find](payload);

    payload = await this.provider[Method.Find](payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Find)) payload = await middleware[Method.Find](payload);

    return payload.data ?? null;
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
   * ```
   */
  public async get(key: string): Promise<StoredValue | null>;

  /**
   * Get a value using a key and/or path.
   * @since 2.0.0
   * @param keyPath A key and/or path at which a value is.
   * @returns The value gotten or null.
   *
   * @example
   * ```javascript
   * await josh.set('key', { path: 'value' });
   *
   * await josh.get('key'); // { path: 'value' }
   * await josh.get({ key: 'key' }); // { path: 'value' }
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', { path: 'value' });
   *
   * await josh.get('key.path'); // 'value'
   * await josh.get({ key: 'key', path: 'path' }); // 'value'
   * await josh.get({ key: 'key', path: ['path'] }); //'value'
   * ```
   */
  public async get<Value = StoredValue>(keyPath: KeyPath): Promise<Value | null> {
    const [key, path] = this.getKeyPath(keyPath);
    let payload: GetPayload<Value> = { method: Method.Get, trigger: Trigger.PreProvider, key, path };

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Get)) payload = await middleware[Method.Get](payload);

    payload = await this.provider.get(payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Get)) payload = await middleware[Method.Get](payload);

    return payload.data ?? null;
  }

  /**
   * Get all stored values.
   * @since 2.0.0
   * @param returnBulkType The return bulk type. Defaults to {@link Bulk.Object}
   * @returns The bulk data.
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value');
   *
   * await josh.getAll(); // { key: 'value' }
   * await josh.getAll(Bulk.OneDimensionalArray); // ['value']
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', { path: 'value' });
   *
   * await josh.getAll(); // { key: { path: 'value' } }
   * await josh.getAll(Bulk.TwoDimensionalArray); // [['key', { path: 'value' }]]
   * ```
   */
  public async getAll<BulkType extends keyof ReturnBulk<StoredValue> = Bulk.Object>(
    returnBulkType?: BulkType
  ): Promise<ReturnBulk<StoredValue>[BulkType]> {
    let payload: GetAllPayload<StoredValue> = { method: Method.GetAll, trigger: Trigger.PreProvider, data: {} };

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.GetAll)) payload = await middleware[Method.GetAll](payload);

    payload = await this.provider.getAll(payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.GetAll)) payload = await middleware[Method.GetAll](payload);

    return this.convertBulkData(payload.data, returnBulkType);
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
    keys: StringArray,
    returnBulkType?: BulkType
  ): Promise<ReturnBulk<StoredValue | null>[BulkType]> {
    let payload: GetManyPayload<StoredValue> = { method: Method.GetMany, trigger: Trigger.PreProvider, keys, data: {} };

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.GetMany)) payload = await middleware[Method.GetMany](payload);

    payload = await this.provider[Method.GetMany](payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.GetMany)) payload = await middleware[Method.GetMany](payload);

    return this.convertBulkData(payload.data, returnBulkType);
  }

  /**
   * Check if a key and/or path exists.
   * @since 2.0.0
   * @param keyPath A key and/or path to the value to check for.
   * @returns Whether the value exists.
   *
   * @example
   * ```javascript
   * await josh.has('key'); // false
   * await josh.has({ key: 'key' }) // false
   *
   * await josh.set('key', 'value');
   *
   * await josh.has('key'); // true
   * await josh.has({ key: 'key' }) // true
   * ```
   *
   * @example
   * ```javascript
   * await josh.has('key.path'); // false
   * await josh.has({ key: 'key', path: 'path' }); // false
   * await josh.has({ key: 'key', path: ['path'] }) // false
   *
   * await josh.set('key', { path: 'value' });
   *
   * await josh.has('key.path'); // true
   * await josh.has({ key: 'key', path: 'path' }); // true
   * await josh.has({ key: 'key', path: ['path'] }) // true
   * ```
   */
  public async has(keyPath: KeyPath): Promise<boolean> {
    const [key, path] = this.getKeyPath(keyPath);
    let payload: HasPayload = { method: Method.Has, trigger: Trigger.PreProvider, key, path, data: false };

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Has)) payload = await middleware[Method.Has](payload);

    payload = await this.provider.has(payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Has)) payload = await middleware[Method.Has](payload);

    return payload.data;
  }

  /**
   * Increment an integer by `1`.
   * @since 2.0.0
   * @param keyPath The key and/or path to an integer value for incrementing.
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
   * await josh.set('key', 0);
   *
   * await josh.inc({ key: 'key' });
   *
   * await josh.get('key'); // 1
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key.path', 0);
   *
   * await josh.inc('key.path');
   *
   * await josh.get('key.path'); // 1
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key.path', 0);
   *
   * await josh.inc({ key: 'key', path: 'path' });
   *
   * await josh.get('key.path'); // 1
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key.path', 0);
   *
   * await josh.inc({ key: 'key', path: ['path'] });
   *
   * await josh.get('key.path'); // 1
   * ```
   */
  public async inc(keyPath: KeyPath): Promise<this> {
    const [key, path] = this.getKeyPath(keyPath);
    let payload: IncPayload = { method: Method.Inc, trigger: Trigger.PreProvider, key, path };

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Inc)) payload = await middleware[Method.Inc](payload);

    payload = await this.provider.inc(payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Inc)) payload = await middleware[Method.Inc](payload);

    return this;
  }

  /**
   * Returns all stored value keys.
   * @since 2.0.0
   * @returns The array of stored value keys.
   *
   * @example
   * ```javascript
   * await josh.set('key', 'value');
   *
   * await josh.keys(); // ['key']
   * ```
   */
  public async keys(): Promise<string[]> {
    let payload: KeysPayload = { method: Method.Keys, trigger: Trigger.PreProvider, data: [] };

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Keys)) payload = await middleware[Method.Keys](payload);

    payload = await this.provider.keys(payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Keys)) payload = await middleware[Method.Keys](payload);

    return payload.data;
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
   */
  public async map<Value = StoredValue>(pathOrHook: Path | MapHook<Value, StoredValue>): Promise<Value[]> {
    let payload: MapPayload<Value, StoredValue> = {
      method: Method.Map,
      trigger: Trigger.PreProvider,
      type: isFunction(pathOrHook) ? Payload.Type.Hook : Payload.Type.Path,
      data: []
    };

    if (isFunction(pathOrHook)) payload.hook = pathOrHook;
    else payload.path = this.getPath(pathOrHook);

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Map)) payload = await middleware[Method.Map](payload);

    payload = await this.provider[Method.Map](payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Map)) payload = await middleware[Method.Map](payload);

    return payload.data;
  }

  /**
   * Executes math operations on a value with an operand at a specified key and/or path.
   * @since 2.0.0
   * @param keyPath The key and/or path the value is at.
   * @param operator The operator that will be used on the operand and value.
   * @param operand The operand to apply to the value.
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
   * await josh.get('key'); 1
   * ```
   */
  public async math(keyPath: KeyPath, operator: MathOperator, operand: number): Promise<this> {
    const [key, path] = this.getKeyPath(keyPath);
    let payload: MathPayload = { method: Method.Math, trigger: Trigger.PreProvider, key, path, operator, operand };

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Math)) payload = await middleware[Method.Math](payload);

    payload = await this.provider[Method.Math](payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Math)) payload = await middleware[Method.Math](payload);

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
   * await josh.set('key', true);
   * await josh.set('key2', false);
   *
   * await josh.partition((value) => value); // [{ key: true }, { key2: false }]
   * ```
   */
  public async partition<BulkType extends keyof ReturnBulk<StoredValue>>(
    hook: PartitionHook<StoredValue>,
    _value: undefined,
    returnBulkType: BulkType
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
   * await josh.partition('path'); // [{ key: true }, { key2: false }]
   * ```
   */
  public async partition<BulkType extends keyof ReturnBulk<StoredValue>>(
    path: Path,
    value: Primitive,
    returnBulkType: BulkType
  ): Promise<[ReturnBulk<StoredValue>[BulkType], ReturnBulk<StoredValue>[BulkType]]>;

  public async partition<BulkType extends keyof ReturnBulk<StoredValue>>(
    pathOrHook: Path | PartitionHook<StoredValue>,
    value?: Primitive,
    returnBulkType?: BulkType
  ): Promise<[ReturnBulk<StoredValue>[BulkType], ReturnBulk<StoredValue>[BulkType]]> {
    if (!isFunction(pathOrHook)) {
      if (value === undefined)
        throw new JoshError({ identifier: Josh.Identifiers.PartitionMissingValue, message: 'The "value" parameter was not found.' });
      if (!isPrimitive(value))
        throw new JoshError({ identifier: Josh.Identifiers.PartitionInvalidValue, message: 'The "value" parameter must be a primitive type.' });
    }

    let payload: PartitionPayload<StoredValue> = {
      method: Method.Partition,
      trigger: Trigger.PreProvider,
      type: isFunction(pathOrHook) ? Payload.Type.Hook : Payload.Type.Value,
      data: { truthy: {}, falsy: {} }
    };

    if (isFunction(pathOrHook)) payload.hook = pathOrHook;
    else {
      payload.path = this.getPath(pathOrHook);
      payload.value = value;
    }

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Partition)) payload = await middleware[Method.Partition](payload);

    payload = await this.provider[Method.Partition](payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Partition)) payload = await middleware[Method.Partition](payload);

    const { truthy, falsy } = payload.data;

    return [this.convertBulkData(truthy, returnBulkType), this.convertBulkData(falsy, returnBulkType)];
  }

  /**
   * Push a value to an array.
   * @since 2.0.0
   * @param keyPath A key and/or path to the array.
   * @param value The value to push.
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * await josh.set('key', []);
   *
   * await josh.push('key', 'value');
   * await josh.push({ key: 'key' }, 'value');
   *
   * await josh.get('key'); // ['value']
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key', { path: [] });
   *
   * await josh.push('key.path', 'value');
   * await josh.push({ key: 'key', path: 'path' }, 'value');
   * await josh.push({ key: 'key', path: ['path'] }, 'value');
   *
   * await josh.get('key.path'); // ['value']
   * ```
   */
  public async push<Value = StoredValue>(keyPath: KeyPath, value: Value): Promise<this> {
    const [key, path] = this.getKeyPath(keyPath);
    let payload: PushPayload<Value> = { method: Method.Push, trigger: Trigger.PreProvider, key, path, value };

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Push)) payload = await middleware[Method.Push](payload);

    payload = await this.provider[Method.Push](payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Push)) payload = await middleware[Method.Push](payload);

    return this;
  }

  /**
   * Gets random value(s).
   * @param options The options for getting random values.
   * @returns The random value(s) or null.
   */
  public async random(options?: Josh.RandomOptions): Promise<StoredValue[] | null> {
    const { count = 1, duplicates = true } = options ?? {};
    let payload: RandomPayload<StoredValue> = { method: Method.Random, trigger: Trigger.PreProvider, count, duplicates };

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Random)) payload = await middleware[Method.Random](payload);

    payload = await this.provider[Method.Random](payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Random)) payload = await middleware[Method.Random](payload);

    return payload.data ?? null;
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
   * await josh.randomKey(); // null
   * ```
   */
  public async randomKey(options: RandomKeyPayload): Promise<string[] | null> {
    const { count = 1, duplicates = true } = options;
    let payload: RandomKeyPayload = { method: Method.RandomKey, trigger: Trigger.PreProvider, count, duplicates };

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.RandomKey)) payload = await middleware[Method.RandomKey](payload);

    payload = await this.provider.randomKey(payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.RandomKey)) payload = await middleware[Method.RandomKey](payload);

    return payload.data ?? null;
  }

  /**
   * Removes an element from an array at a key and/or path that matches the given value.
   * @since 2.0.0
   * @param keyPath The key and/or path to the array to remove an element.
   * @param value The value to match to an element in the array.
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * await provider.set('key', ['value']);
   *
   * await provider.remove('key', 'value');
   *
   * await provider.get('key'); // []
   * ```
   */
  public async remove(keyPath: KeyPath, value: Primitive): Promise<this>;

  /**
   * Removes an element from an array at a key and/or path that are validated by a hook function.
   * @since 2.0.0
   * @param keyPath The key and/or path to the array to remove an element.
   * @param hook The hook function to validate elements in the array.
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * await provider.set('key', ['value']);
   *
   * await provider.remove('key', (value) => value === 'value');
   *
   * await provider.get('key'); // []
   * ```
   */
  public async remove<Value = StoredValue>(keyPath: KeyPath, hook: RemoveHook<Value>): Promise<this>;
  public async remove<Value = StoredValue>(keyPath: KeyPath, valueOrHook: Primitive | RemoveHook<Value>): Promise<this> {
    const [key, path] = this.getKeyPath(keyPath);

    if (!isFunction(valueOrHook)) {
      if (!isPrimitive(valueOrHook))
        throw new JoshError({ identifier: Josh.Identifiers.RemoveInvalidValue, message: 'The "value" parameter was not of a primitive type.' });
    }

    let payload: RemovePayload<Value> = {
      method: Method.Remove,
      trigger: Trigger.PreProvider,
      type: isFunction(valueOrHook) ? Payload.Type.Hook : Payload.Type.Value,
      key,
      path
    };

    if (isFunction(valueOrHook)) payload.hook = valueOrHook;
    else payload.value = valueOrHook;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Remove)) payload = await middleware[Method.Remove](payload);

    payload = await this.provider[Method.Remove](payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Remove)) payload = await middleware[Method.Remove](payload);

    return this;
  }

  /**
   * Sets a value using a key and/or path.
   * @since 2.0.0
   * @param keyPath The key and/or path to set the value to.
   * @param value The value to set at the key and/or path.
   * @returns The {@link Josh} instance.
   *
   * @example
   * ```javascript
   * await josh.set('key', { path: 'value' });
   * await josh.set({ key: 'key' });
   * ```
   *
   * @example
   * ```javascript
   * await josh.set('key.path');
   * await josh.set({ key: 'key', path: 'path' });
   * await josh.set({ key: 'key', path: ['path'] });
   * ```
   */
  public async set<Value = StoredValue>(keyPath: KeyPath, value: Value): Promise<this> {
    const [key, path] = this.getKeyPath(keyPath);
    let payload: SetPayload<Value> = { method: Method.Set, trigger: Trigger.PreProvider, key, path, value };

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Set)) payload = await middleware[Method.Set](payload);

    payload = await this.provider[Method.Set](payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Set)) payload = await middleware[Method.Set](payload);

    return this;
  }

  public async setMany<Value = StoredValue>(entries: [KeyPath, Value][], overwrite = true): Promise<this> {
    let payload: SetManyPayload<Value> = {
      method: Method.SetMany,
      trigger: Trigger.PreProvider,
      data: entries.map(([keyPath, value]) => {
        const [key, path] = this.getKeyPath(keyPath);

        return [{ key, path: this.getPath(path) }, value];
      }),
      overwrite
    };

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.SetMany)) payload = await middleware[Method.SetMany](payload);

    payload = await this.provider[Method.SetMany](payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.SetMany)) payload = await middleware[Method.SetMany](payload);

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
    let payload: SizePayload = { method: Method.Size, trigger: Trigger.PreProvider, data: 0 };

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Size)) payload = await middleware[Method.Size](payload);

    payload = await this.provider[Method.Size](payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Size)) payload = await middleware[Method.Size](payload);

    return payload.data;
  }

  /**
   * Verify if a path's value matches a value.
   * @since 2.0.0
   * @param path A path to the value for equality check.
   * @param value The value to check equality.
   *
   * @example
   * ```javascript
   * await provider.some('path', 'value'); // false
   * ```
   *
   * @example
   * ```javascript
   * await provider.set('key.path', 'value');
   *
   * await provider.some('path', 'value'); // true
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
   * await provider.some((value) => value === 'value'); // false
   * ```
   *
   * @example
   * ```javascript
   * await provider.set('key.path', 'value');
   *
   * await provider.some('path', 'value'); // true
   * ```
   */
  public async some(hook: SomeHook<StoredValue>): Promise<boolean>;
  public async some(pathOrHook: Path | SomeHook<StoredValue>, value?: Primitive): Promise<boolean> {
    if (!isFunction(pathOrHook)) {
      if (value === undefined)
        throw new JoshError({ identifier: Josh.Identifiers.SomeMissingValue, message: 'The "value" parameter was not found.' });
      if (!isPrimitive(value))
        throw new JoshError({ identifier: Josh.Identifiers.SomeInvalidValue, message: 'The "value" parameter must be a primitive type.' });
    }

    let payload: SomePayload<StoredValue> = {
      method: Method.Some,
      trigger: Trigger.PreProvider,
      type: isFunction(pathOrHook) ? Payload.Type.Hook : Payload.Type.Value,
      data: false
    };

    if (isFunction(pathOrHook)) payload.hook = pathOrHook;
    else {
      payload.path = this.getPath(pathOrHook);
      payload.value = value;
    }

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Some)) payload = await middleware[Method.Some](payload);

    payload = await this.provider[Method.Some](payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Some)) payload = await middleware[Method.Some](payload);

    return payload.data;
  }

  /**
   * Update a stored value using a hook function.
   * @param keyPath The key and/or path to the stored value for updating.
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
  public async update<HookValue = StoredValue, Value = HookValue>(keyPath: KeyPath, hook: UpdateHook<HookValue, Value>): Promise<StoredValue | null> {
    const [key, path] = this.getKeyPath(keyPath);
    let payload: UpdatePayload<StoredValue, HookValue, Value> = { method: Method.Update, trigger: Trigger.PreProvider, key, path, hook };

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Update)) payload = await middleware[Method.Update](payload);

    payload = await this.provider[Method.Update](payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Update)) payload = await middleware[Method.Update](payload);

    return payload.data ?? null;
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
    let payload: ValuesPayload<StoredValue> = { method: Method.Values, trigger: Trigger.PreProvider, data: [] };

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPreMiddlewares(Method.Values)) payload = await middleware[Method.Values](payload);

    payload = await this.provider.values(payload);
    payload.trigger = Trigger.PostProvider;

    if (payload.error) throw payload.error;

    for (const middleware of this.middlewares.array()) await middleware.run(payload);
    for (const middleware of this.middlewares.getPostMiddlewares(Method.Values)) payload = await middleware[Method.Values](payload);

    return payload.data;
  }

  public async import(options: Josh.ImportOptions<StoredValue>): Promise<this> {
    let { json, overwrite, clear } = options;

    if (isLegacyExportJSON(json)) {
      emitWarning(
        new JoshError({
          identifier: Josh.Identifiers.LegacyDeprecation,
          message: 'You have imported data from a deprecated legacy format. This will be removed in the next semver major version.'
        })
      );

      json = convertLegacyExportJSON(json);
    }

    if (clear) await this.provider[Method.Clear]({ method: Method.Clear });

    await this.provider[Method.SetMany]({
      method: Method.SetMany,
      data: json.entries.map(([key, value]) => [{ key, path: [] }, value]),
      overwrite: overwrite ?? false
    });

    return this;
  }

  /**
   * Exports all data from the provider.
   * @since 2.0.0
   * @returns The exported data json object.
   */
  public async export(path?: string): Promise<Josh.ExportJSON<StoredValue>> {
    const entries = Object.entries(await this.provider[Method.GetAll]({ method: Method.GetAll, data: {} }));
    const json: Josh.ExportJSON<StoredValue> = { name: this.name, version: Josh.version, exportedTimestamp: Date.now(), entries };

    if (path !== undefined && isNodeEnvironment()) await writeFile(path, JSON.stringify(json));

    return json;
  }

  /** A private method for converting bulk data.
   * @since 2.0.0
   * @private
   * @param data The data to convert.
   * @param returnBulkType The return bulk type. Defaults to {@link Bulk.Object}
   * @returns The bulk data.
   */
  private convertBulkData<Value = StoredValue, K extends keyof ReturnBulk<Value> = Bulk.Object>(
    data: ReturnBulk<Value>[Bulk.Object],
    returnBulkType?: K
  ): ReturnBulk<Value>[K] {
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

  private getKeyPath(keyPath: KeyPath): [string, StringArray] {
    if (typeof keyPath === 'object') return [keyPath.key, this.getPath(keyPath.path ?? [])];

    const [key, ...path] = keyPath.split('.');

    return [key, path];
  }

  private getPath(path: Path): StringArray {
    return typeof path === 'string' ? path.split('.') : path;
  }

  /**
   * The current version of {@link Josh}
   * @since 2.0.0
   */
  public static version = '[VI]{version}[/VI]';

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

    middlewareContextData?: {
      [BuiltInMiddleware.AutoEnsure]: CoreAutoEnsure.ContextData;
    };
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
     * Whether to allow duplicates.
     * @since 2.0.0
     */
    duplicates?: boolean;
  }

  export enum Identifiers {
    EveryInvalidValue = 'everyInvalidValue',

    EveryMissingValue = 'everyMissingValue',

    FilterInvalidValue = 'filterInvalidValue',

    FilterMissingValue = 'filterMissingValue',

    FindInvalidValue = 'findInvalidValue',

    FindMissingValue = 'findMissingValue',

    InvalidProvider = 'invalidProvider',

    LegacyDeprecation = 'legacyDeprecation',

    MiddlewareNotFound = 'middlewareNotFound',

    MissingName = 'missingName',

    PartitionInvalidValue = 'partitionInvalidValue',

    PartitionMissingValue = 'partitionMissingValue',

    RemoveInvalidValue = 'removeInvalidValue',

    SomeInvalidValue = 'someInvalidValue',

    SomeMissingValue = 'someMissingValue',

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
