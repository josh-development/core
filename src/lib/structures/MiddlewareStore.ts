import { Store } from '@sapphire/pieces';
import { Method } from '../types/Method';
import { Middleware } from './Middleware';

export class MiddlewareStore extends Store<Middleware> {
	public constructor() {
		super(Middleware as any, { name: 'middlewares' });
	}

	public findByMethod(method: Method): Middleware[] {
		const middlewares = this.array().filter((middleware) => [method, Method.All].includes(middleware.method));
		const withPositions = middlewares.filter((middleware) => Boolean(middleware.position));
		const withoutPositions = middlewares.filter((middleware) => !middleware.position);
		const sorted = withPositions.sort((a, b) => a.position! - b.position!);

		sorted.push(...withoutPositions);

		return sorted;
	}
}
