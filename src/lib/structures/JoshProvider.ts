import type { Awaitable } from '@sapphire/utilities';
import { JoshProviderError, JoshProviderErrorOptions } from '../errors';
import { resolveCommonIdentifier } from '../functions';
import type { Method, Payloads } from '../types';
import type { Josh } from './Josh';

/**
 * The base provider class. Extend this class to create your own provider.
 * @since 2.0.0
 * @see [MapProvider](default-provider/MapProvider.ts) for an example of how to use this class.
 * @see {@link JoshProvider.Options} for all options available to the JoshProvider class.
 * @example
 * ```typescript
 * export class Provider extends JoshProvider {
 *   // Implement methods...
 * }
 * ```
 */
export abstract class JoshProvider<StoredValue = unknown> {
  /**
   * The name for this provider.
   * @since 2.0.0
   */
  public name?: string;

  /**
   * The {@link Josh} instance for this provider.
   * @since 2.0.0
   */
  public instance?: Josh<StoredValue>;

  /**
   * The options for this provider.
   * @since 2.0.0
   */
  public options: JoshProvider.Options;

  public constructor(options: JoshProvider.Options = {}) {
    this.options = options;
  }

  /**
   * Initialize the provider.
   * @since 2.0.0
   * @param context The provider's context sent by this provider's {@link Josh} instance.
   * @returns The provider's context.
   *
   * @example
   * ```typescript
   * public async init(context: JoshProvider.Context<Value>): Promise<JoshProvider.Context<Value>> {
   *   // Initialize provider...
   *   context = await super.init(context);
   *   // Initialize provider...
   *   return context;
   * }
   * ```
   */
  public async init(context: JoshProvider.Context<StoredValue>): Promise<JoshProvider.Context<StoredValue>> {
    const { name, instance } = context;

    this.name = name;
    this.instance = instance;

    return Promise.resolve(context);
  }

  /**
   * A method which generates a unique automatic key. This key must be unique and cannot overlap other keys.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.AutoKey](payload: Payloads.AutoKey): Awaitable<Payloads.AutoKey>;

  /**
   * A method which clears all entries.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Clear](payload: Payloads.Clear): Awaitable<Payloads.Clear>;

  /**
   * Decrements an entry or a path in an entry by one.
   *
   * An error should be set to the payload and immediately return, if any of the following occurs:
   * - The key and/or path does not exist - `CommonIdentifiers.MissingData`
   * - The data is not an integer - `CommonIdentifiers.InvalidDataType``
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Dec](payload: Payloads.Dec): Awaitable<Payloads.Dec>;

  /**
   * Deletes either the entry itself or a path in an entry.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Delete](payload: Payloads.Delete): Awaitable<Payloads.Delete>;

  /**
   * Deletes multiple entries and/or a path in an entry.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.DeleteMany](payload: Payloads.DeleteMany): Awaitable<Payloads.DeleteMany>;

  /**
   * A method which mimics the functionality of [Array#forEach()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach), except this supports asynchronous functions.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Each](payload: Payloads.Each<StoredValue>): Awaitable<Payloads.Each<StoredValue>>;

  /**
   * A method which ensures an entry exists.
   *
   * If the key exists, it returns the value.
   * If the key does not exist, it creates it and returns the default value.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Ensure](payload: Payloads.Ensure<StoredValue>): Awaitable<Payloads.Ensure<StoredValue>>;

  /**
   * A method which mimics the functionality of [Array#each(https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every)], except this supports asynchronous functions.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Every]<StoredValue>(payload: Payloads.Every.ByHook<StoredValue>): Awaitable<Payloads.Every.ByHook<StoredValue>>;

  /**
   * A method which mimics the functionality of [Array#each(https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every)], except this uses a path and a value to validate.
   *
   * An error should be set to the payload and immediately return, if any of the following occurs:
   * - The data at the path is not a primitive type - `CommonIdentifiers.InvalidDataType`
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Every]<Value>(payload: Payloads.Every.ByValue): Awaitable<Payloads.Every.ByValue>;
  public abstract [Method.Every]<StoredValue>(payload: Payloads.Every<StoredValue>): Awaitable<Payloads.Every<StoredValue>>;

  /**
   * A method which mimics the functionality of [Array#filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter), except this supports asynchronous functions.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Filter](payload: Payloads.Filter.ByHook<StoredValue>): Awaitable<Payloads.Filter.ByHook<StoredValue>>;

  /**
   * A method which mimics the functionality of [Array#filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter), except this uses a path and a value to validate.
   *
   * An error should be set to the payload and immediately return, if any of the following occurs:
   * - The data at the path is not a primitive type - `CommonIdentifiers.InvalidDataType`
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Filter](payload: Payloads.Filter.ByValue<StoredValue>): Awaitable<Payloads.Filter.ByValue<StoredValue>>;
  public abstract [Method.Filter](payload: Payloads.Filter<StoredValue>): Awaitable<Payloads.Filter<StoredValue>>;

  /**
   * A method which mimics the functionality of [Array#find()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find), except this supports asynchronous functions.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Find](payload: Payloads.Find.ByHook<StoredValue>): Awaitable<Payloads.Find.ByHook<StoredValue>>;

  /**
   * A method which mimics the functionality of [Array#find()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find), except this uses a path and value to validate.
   *
   * An error should be set to the payload and immediately return, if any of the following occurs:
   * - The data at the path is not a primitive type - `CommonIdentifiers.InvalidDataType`
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Find](payload: Payloads.Find.ByValue<StoredValue>): Awaitable<Payloads.Find.ByValue<StoredValue>>;
  public abstract [Method.Find](payload: Payloads.Find<StoredValue>): Awaitable<Payloads.Find<StoredValue>>;

  /**
   * A method which mimics the functionality of [Map#get()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get), except this has support for a path.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Get]<Value = StoredValue>(payload: Payloads.Get<Value>): Awaitable<Payloads.Get<Value>>;

  /**
   * A method which mimics the functionality of [Map#entries()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/entries), except returns a record of key-value pairs.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.GetAll](payload: Payloads.GetAll<StoredValue>): Awaitable<Payloads.GetAll<StoredValue>>;

  /**
   * A method to get multiple entries.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.GetMany](payload: Payloads.GetMany<StoredValue>): Awaitable<Payloads.GetMany<StoredValue>>;

  /**
   * A method which mimics the functionality of [Map#has()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/has), except this has support for a path.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Has](payload: Payloads.Has): Awaitable<Payloads.Has>;

  /**
   * Increments a key or path in an entry by 1.
   *
   * An error should be set to the payload and immediately return, if any of the following occurs:
   * - The key and/or path does not exist - `CommonIdentifiers.MissingData`
   * - The data is not an integer - `CommonIdentifiers.InvalidDataType``
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Inc](payload: Payloads.Inc): Awaitable<Payloads.Inc>;

  /**
   * A method which mimics the functionality of [Map#keys()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/keys), except returns an array.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Keys](payload: Payloads.Keys): Awaitable<Payloads.Keys>;

  /**
   * A method which mimics the functionality of [Array#map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map), except supports asynchronous functions.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Map]<Value = StoredValue>(
    payload: Payloads.Map.ByHook<StoredValue, Value>
  ): Awaitable<Payloads.Map.ByHook<StoredValue, Value>>;

  /**
   * Maps all stored values using a path.
   *
   * An error should be set to the payload and immediately return, if any of the following occurs:
   * - The data at the path is not found - `CommonIdentifiers.MissingData`
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Map]<Value = StoredValue>(payload: Payloads.Map.ByPath<Value>): Awaitable<Payloads.Map.ByPath<Value>>;
  public abstract [Method.Map]<Value = StoredValue>(payload: Payloads.Map<StoredValue, Value>): Awaitable<Payloads.Map<StoredValue, Value>>;

  /**
   * A method which executes a math operation a value with an operand either on the entry or a path in the entry.
   *
   * An error should be set to the payload and immediately return, if any of the following occurs:
   * - The key and/or path does not exist - `CommonIdentifiers.MissingData`
   * - The data is not an integer - `CommonIdentifiers.InvalidDataType`
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Math](payload: Payloads.Math): Awaitable<Payloads.Math>;

  /**
   * A method which mimics the functionality of [Array#filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter), except returns both truthy and falsy entries and supports asynchronous functions.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Partition](payload: Payloads.Partition.ByHook<StoredValue>): Awaitable<Payloads.Partition.ByHook<StoredValue>>;

  /**
   * A method which mimics the functionality of [Array#filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter), except returns both truthy and falsy entries and validates using a path and value.
   *
   * An error should be set to the payload and immediately return, if any of the following occurs:
   * - The data at the path is not found - `CommonIdentifiers.MissingData`
   * - The data at the path is not a primitive type - `CommonIdentifiers.InvalidDataType`
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Partition](payload: Payloads.Partition.ByValue<StoredValue>): Awaitable<Payloads.Partition.ByValue<StoredValue>>;
  public abstract [Method.Partition](payload: Payloads.Partition<StoredValue>): Awaitable<Payloads.Partition<StoredValue>>;

  /**
   * A method which mimics the functionality of [Array#push()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push), except this supports a path.
   *
   * An error should be set to the payload and immediately return, if any of the following occurs:
   * - The key and/or path does not exist - `CommonIdentifiers.MissingData`
   * - The data at the path is not an array - `CommonIdentifiers.InvalidDataType`
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Push]<Value>(payload: Payloads.Push<Value>): Awaitable<Payloads.Push<Value>>;

  /**
   * A method which gets random value(s).
   * Whether duplicates are allowed or not are controlled by {@link Payloads.Random.duplicates} option.
   * The amount of values returned is controlled by {@link Payloads.Random.count} option.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Random](payload: Payloads.Random<StoredValue>): Awaitable<Payloads.Random<StoredValue>>;

  /**
   * A method which gets random key(s).
   * Whether duplicates are allowed or not are controlled by {@link Payloads.RandomKey.duplicates} option.
   * The amount of keys returned is controlled by {@link Payloads.RandomKey.count} option.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.RandomKey](payload: Payloads.RandomKey): Awaitable<Payloads.RandomKey>;

  /**
   * Gets random key(s) from the provider.
   * Whether duplicates are allowed or not are controlled by {@link Payloads.RandomKey.duplicates} option.
   * The amount of keys returned is controlled by {@link Payloads.RandomKey.count} option.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Remove]<StoredValue>(payload: Payloads.Remove.ByHook<StoredValue>): Awaitable<Payloads.Remove.ByHook<StoredValue>>;

  /**
   * A method which mimics the functionality of [Array#filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter), except it removes the values filtered and uses a path and value to validate
   *
   * An error should be set to the payload and immediately return, if any of the following occurs:
   * - The key and/or path does not exist - `CommonIdentifiers.MissingData`
   * - The data at the path is not an array - `CommonIdentifiers.InvalidDataType`
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Remove]<Value>(payload: Payloads.Remove.ByValue): Awaitable<Payloads.Remove.ByValue>;
  public abstract [Method.Remove]<StoredValue>(payload: Payloads.Remove<StoredValue>): Awaitable<Payloads.Remove<StoredValue>>;

  /**
   * A method which mimics the functionality of [Map#set()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set), except this supports a path.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Set]<Value = StoredValue>(payload: Payloads.Set<Value>): Awaitable<Payloads.Set<Value>>;

  /**
   * A method which sets multiple entries and/or paths in entries.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.SetMany](payload: Payloads.SetMany): Awaitable<Payloads.SetMany>;

  /**
   * A method which mimics the functionality of [Map#size()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/size)
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Size](payload: Payloads.Size): Awaitable<Payloads.Size>;

  /**
   * A method which mimics the functionality of [Array#some()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some), except this supports asynchronous functions.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Some]<StoredValue>(payload: Payloads.Some.ByHook<StoredValue>): Awaitable<Payloads.Some.ByHook<StoredValue>>;

  /**
   * A method which mimics the functionality of [Array#some()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some), except this uses a path and value to validate.
   *
   * An error should be set to the payload and immediately return, if any of the following occurs:
   * - The path does not exist on an entry - `CommonIdentifiers.MissingData`
   * - The data at the path is not a primitive type - `CommonIdentifiers.InvalidDataType`
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Some]<Value>(payload: Payloads.Some.ByValue): Awaitable<Payloads.Some.ByValue>;
  public abstract [Method.Some]<StoredValue>(payload: Payloads.Some<StoredValue>): Awaitable<Payloads.Some<StoredValue>>;

  /**
   * A method which gets the stored value at a key and passes it to an asynchronous function and sets the data returned.
   *
   * An error should be set to the payload and immediately return, if any of the following occurs:
   * - The key does not exist - `CommonIdentifiers.MissingData`
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Update]<Value>(payload: Payloads.Update<StoredValue, Value>): Awaitable<Payloads.Update<StoredValue, Value>>;

  /**
   * A method which mimics the functionality of [Map#values()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/values), except this returns an array.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Values](payload: Payloads.Values<StoredValue>): Awaitable<Payloads.Values<StoredValue>>;

  /**
   * Creates an Josh provider error.
   * @since 2.0.0
   * @param options The options for the error.
   * @returns The error.
   */
  protected error(options: string | JoshProviderErrorOptions, metadata: Record<string, unknown> = {}): JoshProviderError {
    if (typeof options === 'string') return new JoshProviderError({ identifier: options, message: this.resolveIdentifier(options, metadata) });
    if ('message' in options) return new JoshProviderError(options);

    return new JoshProviderError({ ...options, name: options.name ?? `${this.constructor.name}Error` });
  }

  /**
   * Resolves an identifier.
   * @param identifier The identifier to resolve.
   * @param metadata The metadata to use.
   * @returns The resolved identifier message.
   */
  protected resolveIdentifier(identifier: string, metadata: Record<string, unknown>): string {
    const result = resolveCommonIdentifier(identifier, metadata);

    if (result !== null) return result;

    throw new Error(`Unknown identifier: ${identifier}`);
  }
}

export namespace JoshProvider {
  /**
   * The options to extend for {@link JoshProvider}
   * @since 2.0.0
   *
   * @example
   * ```typescript
   * export namespace Provider {
   *   export interface Options extends JoshProvider.Options {
   *     // Provider options...
   *   }
   * }
   * ```
   */
  export interface Options {}

  /**
   * The context sent by the {@link Josh} instance.
   * @since 2.0.0
   */
  export interface Context<Value = unknown> {
    /**
     * The name of this context.
     * @since 2.0.0
     */
    name: string;

    /**
     * The instance of this context.
     * @since 2.0.0
     */
    instance?: Josh<Value>;

    /**
     * The version of the Josh initiating this provider.
     * @since 2.0.0
     */
    version?: string;

    /**
     * The error of this context.
     * @since 2.0.0
     */
    error?: JoshProviderError;
  }

  export interface Constructor {
    new (options?: Options): JoshProvider;
  }
}
