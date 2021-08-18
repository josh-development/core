import type { Piece, PieceOptions } from '@sapphire/pieces';
import type { Ctor } from '@sapphire/utilities';
import { createClassDecorator } from './utils/createClassDecorator';
import { createProxy } from './utils/createProxy';

/**
 * Decorator function that applies given options to {@link Middleware} piece.
 * @since 2.0.0
 * @param options The options to pass to the middleware constructor.
 *
 * @example
 * ```typescript
 * import { ApplyOptions, Middleware } from '@joshdb/core';
 *
 * (at)ApplyOptions<Middleware.Options>({
 *   name: 'name',
 *   position: 0,
 *   conditions: []
 * })
 * export class CoreMiddleware extends Middleware {}
 * ```
 */
export function ApplyOptions<T extends PieceOptions>(options: T): ClassDecorator {
	return createClassDecorator((target: Ctor<ConstructorParameters<typeof Piece>, Piece>) =>
		createProxy(target, {
			construct: (ctor, [context, baseOptions = {}]) =>
				new ctor(context, {
					...baseOptions,
					...options
				})
		})
	);
}
