import type { Awaitable } from '@sapphire/utilities';
import { JoshProviderError, JoshProviderErrorOptions } from '../errors';
import { resolveCommonIdentifier } from '../functions';
import type { Method, Payloads } from '../types';
import type { Josh } from './Josh';

/**
 * The base provider class. Extend this class to create your own provider.
 *
 * NOTE: If you want an example of how to use this class please see `src/lib/structures/default-provider/MapProvider.ts`
 *
 * @see {@link JoshProvider.Options} for all options available to the JoshProvider class.
 *
 * @since 2.0.0
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
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.AutoKey](payload: Payloads.AutoKey): Awaitable<Payloads.AutoKey>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Clear](payload: Payloads.Clear): Awaitable<Payloads.Clear>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Dec](payload: Payloads.Dec): Awaitable<Payloads.Dec>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Delete](payload: Payloads.Delete): Awaitable<Payloads.Delete>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.DeleteMany](payload: Payloads.DeleteMany): Awaitable<Payloads.DeleteMany>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Ensure](payload: Payloads.Ensure<StoredValue>): Awaitable<Payloads.Ensure<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Every]<StoredValue>(payload: Payloads.Every.ByHook<StoredValue>): Awaitable<Payloads.Every.ByHook<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Every]<Value>(payload: Payloads.Every.ByValue): Awaitable<Payloads.Every.ByValue>;
  public abstract [Method.Every]<StoredValue>(payload: Payloads.Every<StoredValue>): Awaitable<Payloads.Every<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Filter](payload: Payloads.Filter.ByHook<StoredValue>): Awaitable<Payloads.Filter.ByHook<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Filter](payload: Payloads.Filter.ByValue<StoredValue>): Awaitable<Payloads.Filter.ByValue<StoredValue>>;
  public abstract [Method.Filter](payload: Payloads.Filter<StoredValue>): Awaitable<Payloads.Filter<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Find](payload: Payloads.Find.ByHook<StoredValue>): Awaitable<Payloads.Find.ByHook<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Find](payload: Payloads.Find.ByValue<StoredValue>): Awaitable<Payloads.Find.ByValue<StoredValue>>;
  public abstract [Method.Find](payload: Payloads.Find<StoredValue>): Awaitable<Payloads.Find<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Get]<Value = StoredValue>(payload: Payloads.Get<Value>): Awaitable<Payloads.Get<Value>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.GetAll](payload: Payloads.GetAll<StoredValue>): Awaitable<Payloads.GetAll<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.GetMany](payload: Payloads.GetMany<StoredValue>): Awaitable<Payloads.GetMany<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Has](payload: Payloads.Has): Awaitable<Payloads.Has>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Inc](payload: Payloads.Inc): Awaitable<Payloads.Inc>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Keys](payload: Payloads.Keys): Awaitable<Payloads.Keys>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Map]<Value = StoredValue>(
    payload: Payloads.Map.ByHook<StoredValue, Value>
  ): Awaitable<Payloads.Map.ByHook<StoredValue, Value>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Map]<Value = StoredValue>(payload: Payloads.Map.ByPath<Value>): Awaitable<Payloads.Map.ByPath<Value>>;
  public abstract [Method.Map]<Value = StoredValue>(payload: Payloads.Map<StoredValue, Value>): Awaitable<Payloads.Map<StoredValue, Value>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Math](payload: Payloads.Math): Awaitable<Payloads.Math>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Partition](payload: Payloads.Partition.ByHook<StoredValue>): Awaitable<Payloads.Partition.ByHook<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Partition](payload: Payloads.Partition.ByValue<StoredValue>): Awaitable<Payloads.Partition.ByValue<StoredValue>>;
  public abstract [Method.Partition](payload: Payloads.Partition<StoredValue>): Awaitable<Payloads.Partition<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Push]<Value>(payload: Payloads.Push<Value>): Awaitable<Payloads.Push<Value>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Random](payload: Payloads.Random<StoredValue>): Awaitable<Payloads.Random<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.RandomKey](payload: Payloads.RandomKey): Awaitable<Payloads.RandomKey>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Remove]<StoredValue>(payload: Payloads.Remove.ByHook<StoredValue>): Awaitable<Payloads.Remove.ByHook<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Remove]<Value>(payload: Payloads.Remove.ByValue): Awaitable<Payloads.Remove.ByValue>;
  public abstract [Method.Remove]<StoredValue>(payload: Payloads.Remove<StoredValue>): Awaitable<Payloads.Remove<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Set]<Value = StoredValue>(payload: Payloads.Set<Value>): Awaitable<Payloads.Set<Value>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.SetMany]<Value = StoredValue>(payload: Payloads.SetMany<Value>): Awaitable<Payloads.SetMany<Value>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Size](payload: Payloads.Size): Awaitable<Payloads.Size>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Some]<StoredValue>(payload: Payloads.Some.ByHook<StoredValue>): Awaitable<Payloads.Some.ByHook<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Some]<Value>(payload: Payloads.Some.ByValue): Awaitable<Payloads.Some.ByValue>;
  public abstract [Method.Some]<StoredValue>(payload: Payloads.Some<StoredValue>): Awaitable<Payloads.Some<StoredValue>>;

  /**
   * @since 2.0.0
   * @param payload The payload sent by this provider's {@link Josh} instance.
   * @returns The payload (modified), originally sent by this provider's {@link Josh} instance.
   */
  public abstract [Method.Update]<Value>(payload: Payloads.Update<StoredValue, Value>): Awaitable<Payloads.Update<StoredValue, Value>>;

  /**
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

    return new JoshProviderError({ ...options, name: options.name ?? this.constructor.name });
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
}
