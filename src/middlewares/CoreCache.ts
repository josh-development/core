import { ApplyMiddlewareOptions } from '../lib/decorators/ApplyMiddlewareOptions';
import { MapProvider } from '../lib/structures/default-provider/MapProvider';
import type { JoshProvider } from '../lib/structures/JoshProvider';
import { Middleware } from '../lib/structures/Middleware';

@ApplyMiddlewareOptions({
  name: 'cache',
  position: 0,
  conditions: {
    pre: [],
    post: []
  }
})
export class CoreCache<StoredValue = unknown> extends Middleware<StoredValue> {
  public declare context: CoreCache.ContextData<StoredValue>;

  public setContext(context: CoreCache.ContextData<StoredValue>): this {
    return super.setContext({ ...context, provider: context.provider ?? new MapProvider() });
  }
}

export namespace CoreCache {
  export interface ContextData<StoredValue = unknown> extends Middleware.ContextData {
    maxSize: number;

    maxAge: number;

    provider?: JoshProvider<StoredValue>;
  }
}
