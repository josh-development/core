import { Store } from '@sapphire/pieces';
import { Condition, Trigger } from '../types';
import type { Josh } from './Josh';
import type { JoshProvider } from './JoshProvider';
import { Middleware } from './Middleware';

export class MiddlewareStore<T = unknown> extends Store<Middleware> {
	public instance: Josh<T>;

	public provider: JoshProvider<T>;

	public constructor(options: MiddlewareStoreOptions<T>) {
		super(Middleware as any, { name: 'middlewares' });

		const { instance, provider } = options;

		this.instance = instance;
		this.provider = provider;
	}

	public filterByCondition(condition: Condition): Middleware[] {
		const { methods = [], trigger = Trigger.PostProvider } = condition;

		const middlewares = this.array().filter(
			(middleware) =>
				middleware.use && middleware.conditions.some((c) => c.methods!.some((method) => methods.includes(method)) && c.trigger === trigger)
		);

		const withPositions = middlewares.filter((middleware) => Boolean(middleware.position));
		const withoutPositions = middlewares.filter((middleware) => !middleware.position);

		return [...withPositions.sort((a, b) => a.position! - b.position!), ...withoutPositions];
	}
}

export interface MiddlewareStoreOptions<T = unknown> {
	instance: Josh<T>;

	provider: JoshProvider<T>;
}
