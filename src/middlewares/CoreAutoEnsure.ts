import { ApplyMiddlewareOptions } from '../lib/decorators/ApplyMiddlewareOptions';
import type {
  DecPayload,
  GetManyPayload,
  GetPayload,
  IncPayload,
  MathPayload,
  PushPayload,
  RemoveByHookPayload,
  RemoveByValuePayload,
  RemovePayload,
  SetManyPayload,
  SetPayload,
  UpdatePayload
} from '../lib/payloads';
import { Middleware } from '../lib/structures/Middleware';
import { Method } from '../lib/types';

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

  public async [Method.Dec](payload: DecPayload): Promise<DecPayload> {
    if (this.context === undefined) return payload;

    const { defaultValue } = this.context;
    const { key } = payload;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.Get]<Value>(payload: GetPayload<Value>): Promise<GetPayload<Value>> {
    if (payload.data !== undefined) return payload;
    if (this.context === undefined) return payload;

    const { defaultValue } = this.context;
    const { key } = payload;
    const { data } = await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    Reflect.set(payload, 'data', data);

    return payload;
  }

  public async [Method.GetMany]<Value>(payload: GetManyPayload<Value>): Promise<GetManyPayload<Value>> {
    if (Object.keys(payload.data).length !== 0) return payload;
    if (this.context === undefined) return payload;

    const { defaultValue } = this.context;

    for (const [key] of payload.keys) {
      if (payload.data[key] !== null) continue;

      const { data } = await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

      Reflect.set(payload, 'data', data);
    }

    return payload;
  }

  public async [Method.Inc](payload: IncPayload): Promise<IncPayload> {
    if (this.context === undefined) return payload;

    const { defaultValue } = this.context;
    const { key } = payload;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.Push]<Value>(payload: PushPayload<Value>): Promise<PushPayload<Value>> {
    if (this.context === undefined) return payload;

    const { defaultValue } = this.context;
    const { key } = payload;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.Math](payload: MathPayload): Promise<MathPayload> {
    if (this.context === undefined) return payload;

    const { defaultValue } = this.context;
    const { key } = payload;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.Remove]<HookValue>(payload: RemoveByHookPayload<HookValue>): Promise<RemoveByHookPayload<HookValue>>;
  public async [Method.Remove](payload: RemoveByValuePayload): Promise<RemoveByValuePayload>;
  public async [Method.Remove]<HookValue>(payload: RemovePayload<HookValue>): Promise<RemovePayload<HookValue>> {
    if (this.context === undefined) return payload;

    const { defaultValue } = this.context;
    const { key } = payload;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.Set]<Value>(payload: SetPayload<Value>): Promise<SetPayload<Value>> {
    if (this.context === undefined) return payload;

    const { defaultValue } = this.context;
    const { key } = payload;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.SetMany]<Value>(payload: SetManyPayload<Value>): Promise<SetManyPayload<Value>> {
    if (this.context === undefined) return payload;

    const { defaultValue } = this.context;

    for (const [{ key }] of payload.data) await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }

  public async [Method.Update]<StoredValue, Value, HookValue>(
    payload: UpdatePayload<StoredValue, Value, HookValue>
  ): Promise<UpdatePayload<StoredValue, Value, HookValue>> {
    if (this.context === undefined) return payload;

    const { defaultValue } = this.context;
    const { key } = payload;

    await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

    return payload;
  }
}

export namespace CoreAutoEnsure {
  export interface ContextData<StoredValue = unknown> extends Middleware.ContextData {
    defaultValue: StoredValue;
  }
}
