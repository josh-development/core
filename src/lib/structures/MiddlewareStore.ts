import { Store } from '@sapphire/pieces';
import type { Method, Trigger } from '../types';
import type { Josh } from './Josh';
import { Middleware } from './Middleware';

/**
 * The store to contain {@link Middleware} pieces.
 * @since 2.0.0
 */
export class MiddlewareStore<StoredValue = unknown> extends Store<Middleware> {
	/**
	 * The {@link Josh} instance for this store.
	 */
	public instance: Josh<StoredValue>;

	public constructor(options: MiddlewareStoreOptions<StoredValue>) {
		super(Middleware as any, { name: 'middlewares' });

		const { instance } = options;

		this.instance = instance;
	}

	public array(): Middleware[] {
		return Array.from(this.values());
	}

	/**
	 * Filter middlewares by their conditions.
	 * @since 2.0.0
	 * @param method The method to filter by.
	 * @param trigger The trigger to filter by.
	 * @returns An array of middleware's in which the method and trigger matched.
	 */
	public filterByCondition(method: Method, trigger: Trigger): Middleware[] {
		const middlewares = this.array().filter(
			(middleware) => middleware.use && middleware.conditions.some((c) => c.methods.includes(method) && c.trigger === trigger)
		);

		const withPositions = middlewares.filter((middleware) => (middleware.position === undefined ? false : true));
		const withoutPositions = middlewares.filter((middleware) => (middleware.position === undefined ? true : false));

		return [...withPositions.sort((a, b) => a.position! - b.position!), ...withoutPositions];
	}
}

/**
 * The options for {@link MiddlewareStore}
 * @since 2.0.0
 */
export interface MiddlewareStoreOptions<StoredValue = unknown> {
	/**
	 * The {@link Josh} instance for this store.
	 * @since 2.0.0
	 */
	instance: Josh<StoredValue>;
}
