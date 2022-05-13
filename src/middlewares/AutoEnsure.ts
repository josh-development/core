import { Method, Payloads } from '@joshdb/provider';
import { ApplyMiddlewareOptions, PostProvider, PreProvider } from '../lib/decorators';
import { Middleware } from '../lib/structures/Middleware';

@ApplyMiddlewareOptions({ name: 'autoEnsure' })
export class AutoEnsure<StoredValue = unknown> extends Middleware<AutoEnsure.ContextData<StoredValue>, StoredValue> {
  @PreProvider()
  public async [Method.Dec](payload: Payloads.Dec): Promise<Payloads.Dec> {
    const { key } = payload;
    const { defaultValue } = this.context;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  @PostProvider()
  public async [Method.Get]<Value = StoredValue>(payload: Payloads.Get<Value>): Promise<Payloads.Get<Value>> {
    if ('data' in payload) return payload;

    const { key } = payload;
    const { defaultValue } = this.context;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });
    payload.data = defaultValue as unknown as Value;

    return payload;
  }

  @PostProvider()
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

  @PreProvider()
  public async [Method.Inc](payload: Payloads.Inc): Promise<Payloads.Inc> {
    const { key } = payload;
    const { defaultValue } = this.context;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  @PreProvider()
  public async [Method.Push]<Value>(payload: Payloads.Push<Value>): Promise<Payloads.Push<Value>> {
    const { key } = payload;
    const { defaultValue } = this.context;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  @PreProvider()
  public async [Method.Math](payload: Payloads.Math): Promise<Payloads.Math> {
    const { key } = payload;
    const { defaultValue } = this.context;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.Remove]<Value = StoredValue>(payload: Payloads.Remove.ByHook<Value>): Promise<Payloads.Remove.ByHook<Value>>;
  public async [Method.Remove](payload: Payloads.Remove.ByValue): Promise<Payloads.Remove.ByValue>;

  @PreProvider()
  public async [Method.Remove]<Value = StoredValue>(payload: Payloads.Remove<Value>): Promise<Payloads.Remove<Value>> {
    const { key } = payload;
    const { defaultValue } = this.context;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  @PreProvider()
  public async [Method.Set]<Value = StoredValue>(payload: Payloads.Set<Value>): Promise<Payloads.Set<Value>> {
    const { key } = payload;
    const { defaultValue } = this.context;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  @PreProvider()
  public async [Method.SetMany](payload: Payloads.SetMany): Promise<Payloads.SetMany> {
    const { entries } = payload;
    const { defaultValue } = this.context;

    for (const [{ key }] of entries) await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  @PreProvider()
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
