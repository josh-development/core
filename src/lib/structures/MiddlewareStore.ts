import { Store } from '@sapphire/pieces';
import type { Method, Trigger } from '../types';
import type { Josh } from './Josh';
import { Middleware } from './Middleware';

export class MiddlewareStore<Value = unknown> extends Store<Middleware> {
	public instance: Josh<Value>;

	public constructor(options: MiddlewareStoreOptions<Value>) {
		super(Middleware as any, { name: 'middlewares' });

		const { instance } = options;

		this.instance = instance;
	}

	public filterByCondition(method: Method, trigger: Trigger): Middleware[] {
		const middlewares = this.array().filter(
			(middleware) => middleware.use && middleware.conditions.some((c) => c.methods!.includes(method) && c.trigger === trigger)
		);

		const withPositions = middlewares.filter((middleware) => Boolean(middleware.position));
		const withoutPositions = middlewares.filter((middleware) => !middleware.position);

		return [...withPositions.sort((a, b) => a.position! - b.position!), ...withoutPositions];
	}
}

export interface MiddlewareStoreOptions<Value = unknown> {
	instance: Josh<Value>;
}
