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
   * Generates a unique automatic key. This key must be unique and cannot overlap other keys.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.AutoKey](payload: Payloads.AutoKey): Awaitable<Payloads.AutoKey>;

  /**
   * Clears the provider of it's data entries.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Clear](payload: Payloads.Clear): Awaitable<Payloads.Clear>;

  /**
   * Decrements a key or path in an entry by 1.
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
   * Deletes a key or path in an entry.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Delete](payload: Payloads.Delete): Awaitable<Payloads.Delete>;

  /**
   * Deletes multiple keys in the provider.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.DeleteMany](payload: Payloads.DeleteMany): Awaitable<Payloads.DeleteMany>;

  /**
   * Iterates over all stored values and the keys in the provider and passes them into the hook function.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Each](payload: Payloads.Each<StoredValue>): Awaitable<Payloads.Each<StoredValue>>;

  /**
   * Ensures a key exists.
   *
   * If the key exists, it returns the value.
   * If the key does not exist, it creates it and returns the default value.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Ensure](payload: Payloads.Ensure<StoredValue>): Awaitable<Payloads.Ensure<StoredValue>>;

  /**
   * Checks every stored value with a function.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Every]<StoredValue>(payload: Payloads.Every.ByHook<StoredValue>): Awaitable<Payloads.Every.ByHook<StoredValue>>;

  /**
   * Checks every stored value at a path against the given value.
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
   * Filter stored values using a hook function.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Filter](payload: Payloads.Filter.ByHook<StoredValue>): Awaitable<Payloads.Filter.ByHook<StoredValue>>;

  /**
   * Filter stored values at a path against the given value.
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
   * Find a stored value using a hook function.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Find](payload: Payloads.Find.ByHook<StoredValue>): Awaitable<Payloads.Find.ByHook<StoredValue>>;

  /**
   * Find a stored value at a path against the given value.
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
   * Get a value using a key and/or path.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Get]<Value = StoredValue>(payload: Payloads.Get<Value>): Awaitable<Payloads.Get<Value>>;

  /**
   * Gets all data from the provider.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.GetAll](payload: Payloads.GetAll<StoredValue>): Awaitable<Payloads.GetAll<StoredValue>>;

  /**
   * Gets multiple keys from the provider.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.GetMany](payload: Payloads.GetMany<StoredValue>): Awaitable<Payloads.GetMany<StoredValue>>;

  /**
   * Checks whether a key and/or path exists.
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
   * Returns all keys in the provider.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Keys](payload: Payloads.Keys): Awaitable<Payloads.Keys>;

  /**
   * Maps all stored values using a hook function.
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
   * Executes math operations on a value with an operand at a specified key and/or path.
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
   * Filter stored values using a hook function and get both truthy and falsy results.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Partition](payload: Payloads.Partition.ByHook<StoredValue>): Awaitable<Payloads.Partition.ByHook<StoredValue>>;

  /**
   * Filter stored values using a path and get both truthy and falsy results.
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
   * Push a value to an array at a specified key and/or path.
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
   * Gets random value(s) from the provider.
   * Whether duplicates are allowed or not are controlled by {@link Payloads.Random.duplicates} option.
   * The amount of values returned is controlled by {@link Payloads.Random.count} option.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Random](payload: Payloads.Random<StoredValue>): Awaitable<Payloads.Random<StoredValue>>;

  /**
   * Gets a random key from the provider.
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
   * Removes an element from an array at a specified key and/or path.
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
   * Sets a value at a specified key and/or path.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Set]<Value = StoredValue>(payload: Payloads.Set<Value>): Awaitable<Payloads.Set<Value>>;

  /**
   * Set many values at specified keys and/or paths.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.SetMany](payload: Payloads.SetMany): Awaitable<Payloads.SetMany>;

  /**
   * Returns the amount of entries in the provider.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Size](payload: Payloads.Size): Awaitable<Payloads.Size>;

  /**
   * Identical to {@link JoshProvider.find}, but returns a boolean instead of a value.
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Some]<StoredValue>(payload: Payloads.Some.ByHook<StoredValue>): Awaitable<Payloads.Some.ByHook<StoredValue>>;

  /**
   * Identical to {@link JoshProvider.find}, but returns a boolean instead of a value.
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
   * Updates a value with a function.
   *
   * An error should be set to the payload and immediately return, if any of the following occurs:
   * - The key does not exist - `CommonIdentifiers.MissingData`
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Update]<Value>(payload: Payloads.Update<StoredValue, Value>): Awaitable<Payloads.Update<StoredValue, Value>>;

  /**
   * Returns all entries in the provider.
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
