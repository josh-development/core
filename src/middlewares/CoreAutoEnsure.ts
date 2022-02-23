import { ApplyMiddlewareOptions } from '../lib/decorators/ApplyMiddlewareOptions';
import { Middleware } from '../lib/structures/Middleware';
import { Method, Payloads } from '../lib/types';

@ApplyMiddlewareOptions({
  name: 'autoEnsure',
  position: 0,
  conditions: {
    pre: [Method.Dec, Method.Inc, Method.Push, Method.Remove, Method.Set, Method.SetMany],
    post: [Method.Get, Method.GetMany, Method.Update]
  }
})
export class CoreAutoEnsure<StoredValue = unknown> extends Middleware<StoredValue> {
  public declare context: CoreAutoEnsure.ContextData<StoredValue>;

  public setContext(context: CoreAutoEnsure.ContextData<StoredValue>): this {
    return super.setContext(context);
  }

  public async [Method.Dec](payload: Payloads.Dec): Promise<Payloads.Dec> {
    const { defaultValue } = this.context;
    const { key } = payload;

    await this.provider.ensure({ method: Method.Ensure, key, defaultValue });

    return payload;
  }

  public async [Method.Get]<Value = StoredValue>(payload: Payloads.Get<Value>): Promise<Payloads.Get<Value>> {
    if ('data' in payload) return payload;

    const { defaultValue } = this.context;
    const { key } = payload;

    Reflect.set(payload, 'data', (await this.provider.ensure({ method: Method.Ensure, key, defaultValue })).data);

    return payload;
  }

  public async [Method.GetMany](payload: Payloads.GetMany<StoredValue>): Promise<Payloads.GetMany<StoredValue>> {
    const { defaultValue } = this.context;
    const { keys, data } = payload;

    if (data === undefined) return payload;
    if (keys.length === 0) return payload;

    for (const key of keys) {
      if (data[key] !== null) continue;

      Reflect.set(payload, 'data', (await this.provider.ensure({ method: Method.Ensure, key, defaultValue })).data);
    }

    return payload;
  }

  public async [Method.Inc](payload: Payloads.Inc): Promise<Payloads.Inc> {
    const { defaultValue } = this.context;
    const { key } = payload;

    await this.provider.ensure({ method: Method.Ensure, key, defaultValue });

    return payload;
  }

  public async [Method.Push]<Value>(payload: Payloads.Push<Value>): Promise<Payloads.Push<Value>> {
    if (!this.context) return payload;

    const { defaultValue } = this.context;
    const { key } = payload;

    await this.provider.ensure({ method: Method.Ensure, key, defaultValue });

    return payload;
  }

  public async [Method.Math](payload: Payloads.Math): Promise<Payloads.Math> {
    const { defaultValue } = this.context;
    const { key } = payload;

    await this.provider.ensure({ method: Method.Ensure, key, defaultValue });

    return payload;
  }

  public async [Method.Remove]<Value = StoredValue>(payload: Payloads.Remove.ByHook<Value>): Promise<Payloads.Remove.ByHook<Value>>;
  public async [Method.Remove](payload: Payloads.Remove.ByValue): Promise<Payloads.Remove.ByValue>;
  public async [Method.Remove]<Value = StoredValue>(payload: Payloads.Remove<Value>): Promise<Payloads.Remove<Value>> {
    if (!this.context) return payload;

    const { defaultValue } = this.context;
    const { key } = payload;

    await this.provider.ensure({ method: Method.Ensure, key, defaultValue });

    return payload;
  }

  public async [Method.Set]<Value = StoredValue>(payload: Payloads.Set<Value>): Promise<Payloads.Set<Value>> {
    const { defaultValue } = this.context;
    const { key } = payload;

    await this.provider.ensure({ method: Method.Ensure, key, defaultValue });

    return payload;
  }

  public async [Method.SetMany]<Value>(payload: Payloads.SetMany<Value>): Promise<Payloads.SetMany<Value>> {
    const { defaultValue } = this.context;
    const { entries } = payload;

    for (const [{ key }] of entries) await this.provider.ensure({ method: Method.Ensure, key, defaultValue });

    return payload;
  }

  public async [Method.Update]<Value = StoredValue>(payload: Payloads.Update<StoredValue, Value>): Promise<Payloads.Update<StoredValue, Value>> {
    const { defaultValue } = this.context;
    const { key } = payload;

    await this.provider.ensure({ method: Method.Ensure, key, defaultValue });

    return payload;
  }
}

export namespace CoreAutoEnsure {
  export interface ContextData<StoredValue = unknown> extends Middleware.ContextData {
    defaultValue: StoredValue;
  }
}
