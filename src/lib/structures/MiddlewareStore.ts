import type { NonNullObject } from '@sapphire/utilities';
import { Method, Trigger } from '../types';
import type { Josh } from './Josh';
import type { Middleware } from './Middleware';

/**
 * The store to contain {@link Middleware} classes.
 * @since 2.0.0
 */
export class MiddlewareStore<StoredValue = unknown> extends Map<string, Middleware<NonNullObject, StoredValue>> {
  /**
   * The link {@link Josh} instance for this store.
   * @since 2.0.0
   */
  public instance: Josh<StoredValue>;

  public constructor(options: MiddlewareStoreOptions<StoredValue>) {
    super();

    const { instance } = options;

    this.instance = instance;
  }

  /**
   * Gets an array of middlewares.
   * @since 2.0.0
   * @returns The array of middlewares.
   */
  public array(): Middleware<NonNullObject, StoredValue>[] {
    return Array.from(this.values());
  }

  /**
   * Get pre provider middlewares by method.
   * @since 2.0.0
   * @param method The method to filter by.
   * @returns The middlewares after filtered.
   */
  public getPreMiddlewares(method: Method): Middleware<NonNullObject, StoredValue>[] {
    return this.filterByCondition(method, Trigger.PreProvider);
  }

  /**
   * Get post provider middlewares by method.
   * @since 2.0.0
   * @param method The method to filter by.
   * @returns The middlewares after filtered.
   */
  public getPostMiddlewares(method: Method): Middleware<NonNullObject, StoredValue>[] {
    return this.filterByCondition(method, Trigger.PostProvider);
  }

  /**
   * Filter middlewares by their conditions.
   * @since 2.0.0
   * @param method
   * @param trigger
   * @returns
   */
  private filterByCondition(method: Method, trigger: Trigger): Middleware<NonNullObject, StoredValue>[] {
    const middlewares = this.array().filter((middleware) =>
      trigger === Trigger.PreProvider ? middleware.conditions.pre.includes(method) : middleware.conditions.post.includes(method)
    );

    const withPositions = middlewares.filter((middleware) => middleware.position !== undefined);
    const withoutPositions = middlewares.filter((middleware) => middleware.position !== undefined);

    return [...withPositions.sort((a, b) => a.position! - b.position!), ...withoutPositions];
  }
}

export interface MiddlewareStoreOptions<StoredValue = unknown> {
  instance: Josh<StoredValue>;
}
