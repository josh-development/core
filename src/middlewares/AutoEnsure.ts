import { ApplyMiddlewareOptions } from '../lib/decorators';
import { Middleware } from '../lib/structures/Middleware';
import { Method, Payloads } from '../lib/types';

@ApplyMiddlewareOptions({
  name: 'autoEnsure',
  position: 0,
  conditions: {
    pre: [Method.Dec, Method.Inc, Method.Push, Method.Remove, Method.Set, Method.SetMany, Method.Update],
    post: [Method.Get, Method.GetMany]
  }
})
export class AutoEnsure<StoredValue = unknown> extends Middleware<StoredValue> {
  protected declare context: AutoEnsure.ContextData<StoredValue>;

  public constructor(context: AutoEnsure.ContextData<StoredValue>) {
    super(context);
  }

  public async [Method.Dec](payload: Payloads.Dec): Promise<Payloads.Dec> {
    const { key } = payload;
    const { defaultValue } = this.context;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.Get]<Value = StoredValue>(payload: Payloads.Get<Value>): Promise<Payloads.Get<Value>> {
    if ('data' in payload) return payload;

    const { key } = payload;
    const { defaultValue } = this.context;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });
    payload.data = defaultValue as unknown as Value;

    return payload;
  }

  public async [Method.GetMany](payload: Payloads.GetMany<StoredValue>): Promise<Payloads.GetMany<StoredValue>> {
    payload.data ??= {};

    if (Object.keys(payload.data).length !== 0) return payload;

    for (const key of payload.keys) {
      if (payload.data[key] !== null) continue;

      const { defaultValue } = this.context;

      await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });
      payload.data[key] = defaultValue;
    }

    return payload;
  }

  public async [Method.Inc](payload: Payloads.Inc): Promise<Payloads.Inc> {
    const { key } = payload;
    const { defaultValue } = this.context;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.Push]<Value>(payload: Payloads.Push<Value>): Promise<Payloads.Push<Value>> {
    const { key } = payload;
    const { defaultValue } = this.context;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.Math](payload: Payloads.Math): Promise<Payloads.Math> {
    const { key } = payload;
    const { defaultValue } = this.context;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.Remove]<Value = StoredValue>(payload: Payloads.Remove.ByHook<Value>): Promise<Payloads.Remove.ByHook<Value>>;
  public async [Method.Remove](payload: Payloads.Remove.ByValue): Promise<Payloads.Remove.ByValue>;
  public async [Method.Remove]<Value = StoredValue>(payload: Payloads.Remove<Value>): Promise<Payloads.Remove<Value>> {
    const { key } = payload;
    const { defaultValue } = this.context;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.Set]<Value = StoredValue>(payload: Payloads.Set<Value>): Promise<Payloads.Set<Value>> {
    const { key } = payload;
    const { defaultValue } = this.context;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.SetMany](payload: Payloads.SetMany): Promise<Payloads.SetMany> {
    if (!this.context) return payload;

    const { defaultValue } = this.context;

    for (const [{ key }] of payload.entries) await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.Update]<Value = StoredValue>(payload: Payloads.Update<StoredValue, Value>): Promise<Payloads.Update<StoredValue, Value>> {
    const { key } = payload;
    const { defaultValue } = this.context;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }
}

export namespace AutoEnsure {
  export interface ContextData<StoredValue = unknown> {
    defaultValue: StoredValue;
  }
}
