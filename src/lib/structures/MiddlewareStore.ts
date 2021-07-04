import { Store } from '@sapphire/pieces';
import { Middleware } from './Middleware';

export class MiddlewareStore extends Store<Middleware> {
	public constructor() {
		super(Middleware as any, { name: 'middleware' });
	}
}
