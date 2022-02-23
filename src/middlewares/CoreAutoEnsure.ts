import { ApplyMiddlewareOptions } from '../lib/decorators/ApplyMiddlewareOptions';
import { Middleware } from '../lib/structures/Middleware';
import { BuiltInMiddleware, Method, Payloads } from '../lib/types';

@ApplyMiddlewareOptions({
  name: BuiltInMiddleware.AutoEnsure,
  position: 0,
  conditions: {
    pre: [Method.Dec, Method.Inc, Method.Push, Method.Remove, Method.Set, Method.SetMany],
    post: [Method.Get, Method.GetMany, Method.Update]
  }
})
export class CoreAutoEnsure<StoredValue = unknown> extends Middleware<StoredValue> {
  public async [Method.Dec](payload: Payloads.Dec): Promise<Payloads.Dec> {
    if (!this.context) return payload;

    const { defaultValue } = this.context;
    const { key } = payload;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.Get]<Value = StoredValue>(payload: Payloads.Get<Value>): Promise<Payloads.Get<Value>> {
    if (payload.data !== undefined) return payload;
    if (!this.context) return payload;

    const { defaultValue } = this.context;
    const { key } = payload;
    const { data } = await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    Reflect.set(payload, 'data', data);

    return payload;
  }

  public async [Method.GetMany](payload: Payloads.GetMany<StoredValue>): Promise<Payloads.GetMany<StoredValue>> {
    if (Object.keys(payload.data).length !== 0) return payload;
    if (!this.context) return payload;

    const { defaultValue } = this.context;

    for (const [key] of payload.keys) {
      if (payload.data[key] !== null) continue;

      const { data } = await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

      Reflect.set(payload, 'data', data);
    }

    return payload;
  }

  public async [Method.Inc](payload: Payloads.Inc): Promise<Payloads.Inc> {
    if (!this.context) return payload;

    const { defaultValue } = this.context;
    const { key } = payload;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.Push]<Value>(payload: Payloads.Push<Value>): Promise<Payloads.Push<Value>> {
    if (!this.context) return payload;

    const { defaultValue } = this.context;
    const { key } = payload;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.Math](payload: Payloads.Math): Promise<Payloads.Math> {
    if (!this.context) return payload;

    const { defaultValue } = this.context;
    const { key } = payload;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.Remove]<Value = StoredValue>(payload: Payloads.Remove.ByHook<Value>): Promise<Payloads.Remove.ByHook<Value>>;
  public async [Method.Remove](payload: Payloads.Remove.ByValue): Promise<Payloads.Remove.ByValue>;
  public async [Method.Remove]<Value = StoredValue>(payload: Payloads.Remove<Value>): Promise<Payloads.Remove<Value>> {
    if (!this.context) return payload;

    const { defaultValue } = this.context;
    const { key } = payload;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.Set]<Value = StoredValue>(payload: Payloads.Set<Value>): Promise<Payloads.Set<Value>> {
    if (!this.context) return payload;

    const { defaultValue } = this.context;
    const { key } = payload;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.SetMany]<Value>(payload: Payloads.SetMany<Value>): Promise<Payloads.SetMany<Value>> {
    if (!this.context) return payload;

    const { defaultValue } = this.context;

    for (const [{ key }] of payload.data) await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.Update]<Value = StoredValue>(payload: Payloads.Update<StoredValue, Value>): Promise<Payloads.Update<StoredValue, Value>> {
    if (!this.context) return payload;

    const { defaultValue } = this.context;
    const { key } = payload;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  private get context(): CoreAutoEnsure.ContextData<StoredValue> | undefined {
    // @ts-expect-error 2322
    return this.instance.options.middlewareContextData?.[BuiltInMiddleware.AutoEnsure];
  }
}

export namespace CoreAutoEnsure {
  export interface ContextData<StoredValue = unknown> extends Middleware.ContextData {
    defaultValue: StoredValue;
  }
}
