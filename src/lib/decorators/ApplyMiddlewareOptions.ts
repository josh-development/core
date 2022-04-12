import type { Ctor } from '@sapphire/utilities';
import type { Middleware } from '../../lib/structures/Middleware';
import { createClassDecorator } from './utils/createClassDecorator';
import { createProxy } from './utils/createProxy';

/**
 * Decorator function that applies given options to {@link Middleware} class.
 * @since 2.0.0
 * @param options The middleware options.
 *
 * @example
 * ```typescript
 * import { ApplyMiddlewareOptions, Middleware } from '@joshdb/core';
 *
 * @ApplyMiddlewareOptions({
 *   name: 'name',
 *   // More options...
 * })
 * export class CoreMiddleware extends Middleware {}
 * ``` */
export function ApplyMiddlewareOptions(options: Middleware.Options): ClassDecorator {
  return createClassDecorator((target: Ctor<ConstructorParameters<typeof Middleware>, Middleware>) =>
    createProxy(target, {
      construct: (ctor, [context]) => new ctor(context, options)
    })
  );
}
