import { Store } from '@sapphire/pieces';
import { Method } from '../types/Method';
import type { Josh } from './Josh';
import { Middleware } from './Middleware';

export class MiddlewareStore<T = unknown> extends Store<Middleware> {
	public instance: Josh<T>;

	public constructor(options: MiddlewareStoreOptions<T>) {
		super(Middleware as any, { name: 'middlewares' });

		const { instance } = options;

		this.instance = instance;
	}

	public findByMethod(method: Method): Middleware[] {
		const middlewares = this.array().filter((middleware) => [method, Method.All].includes(middleware.method));
		const withPositions = middlewares.filter((middleware) => Boolean(middleware.position));
		const withoutPositions = middlewares.filter((middleware) => !middleware.position);
		const sorted = withPositions.sort((a, b) => a.position! - b.position!);

		return [...sorted, ...withoutPositions];
	}
}

export interface MiddlewareStoreOptions<T = unknown> {
	instance: Josh<T>;
}
