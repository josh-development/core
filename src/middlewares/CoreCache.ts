import { ApplyMiddlewareOptions } from '../lib/decorators/ApplyMiddlewareOptions';
import { MapProvider } from '../lib/structures/default-provider/MapProvider';
import type { JoshProvider } from '../lib/structures/JoshProvider';
import { Middleware } from '../lib/structures/Middleware';
import { Method, Payloads } from '../lib/types';

@ApplyMiddlewareOptions({
  name: 'cache',
  position: 0,
  conditions: {
    pre: [Method.Ensure],
    post: [Method.Clear, Method.Dec, Method.Delete, Method.DeleteMany]
  }
})
export class CoreCache<StoredValue = unknown> extends Middleware<StoredValue> {
  public declare context: CoreCache.ContextData<StoredValue>;

  private entries = new Map<string, CoreCache.Entry>();

  public setContext(context: Partial<CoreCache.ContextData<StoredValue>>): this {
    const { maxSize = 1000, maxAge = 60_000 * 5, provider = new MapProvider() } = context;

    return super.setContext({ maxSize, maxAge, provider });
  }

  public async [Method.Clear](payload: Payloads.Clear): Promise<Payloads.Clear> {
    await this.clearCachedEntries();

    payload = await this.provider.clear(payload);

    return payload;
  }

  public async [Method.Dec](payload: Payloads.Dec): Promise<Payloads.Dec> {
    const { provider } = this.context;
    const { key } = payload;

    await this.ensureCachedEntry(key);
    payload = await provider.dec(payload);
    await this.clearOverflowedEntries();

    return payload;
  }

  public async [Method.Delete](payload: Payloads.Delete): Promise<Payloads.Delete> {
    const { key, path } = payload;
    const { provider } = this.context;

    await this.ensureCachedEntry(key);
    payload = await provider.delete(payload);

    if (path.length === 0) await this.deleteCachedEntry(key);

    await this.clearOverflowedEntries();

    return payload;
  }

  public async [Method.DeleteMany](payload: Payloads.DeleteMany): Promise<Payloads.DeleteMany> {
    const { keys } = payload;
    const { provider } = this.context;

    for (const key of keys) await this.deleteCachedEntry(key);

    payload = await provider.deleteMany(payload);

    return payload;
  }

  public async [Method.Ensure](payload: Payloads.Ensure<StoredValue>): Promise<Payloads.Ensure<StoredValue>> {
    const { provider } = this.context;
    const { key } = payload;

    await this.ensureCachedEntry(key);
    await provider.ensure(payload);

    return payload;
  }

  public async [Method.Every](payload: Payloads.Every.ByHook<StoredValue>): Promise<Payloads.Every.ByHook<StoredValue>>;
  public async [Method.Every](payload: Payloads.Every.ByValue): Promise<Payloads.Every.ByValue>;
  public async [Method.Every](payload: Payloads.Every<StoredValue>): Promise<Payloads.Every<StoredValue>> {
    const { provider } = this.context;

    payload = await provider.every(payload);

    return payload;
  }

  public async [Method.Filter](payload: Payloads.Filter.ByHook<StoredValue>): Promise<Payloads.Filter.ByHook<StoredValue>>;
  public async [Method.Filter](payload: Payloads.Filter.ByValue<StoredValue>): Promise<Payloads.Filter.ByValue<StoredValue>>;
  public async [Method.Filter](payload: Payloads.Filter<StoredValue>): Promise<Payloads.Filter<StoredValue>> {
    const { provider } = this.context;

    payload = await provider.filter(payload);

    return payload;
  }

  public async [Method.Find](payload: Payloads.Find.ByHook<StoredValue>): Promise<Payloads.Find.ByHook<StoredValue>>;
  public async [Method.Find](payload: Payloads.Find.ByValue<StoredValue>): Promise<Payloads.Find.ByValue<StoredValue>>;
  public async [Method.Find](payload: Payloads.Find<StoredValue>): Promise<Payloads.Find<StoredValue>> {
    const { provider } = this.context;

    payload = await provider.find(payload);

    return payload;
  }

  public async [Method.Get]<Value = StoredValue>(payload: Payloads.Get<Value>): Promise<Payloads.Get<Value>> {
    const { provider } = this.context;
    const { key } = payload;

    await this.ensureCachedEntry(key);
    payload = await provider.get(payload);
    await this.clearOverflowedEntries();

    return payload;
  }

  public async [Method.GetAll](payload: Payloads.GetAll<StoredValue>): Promise<Payloads.GetAll<StoredValue>> {
    const { provider } = this.context;

    payload = await provider.getAll(payload);

    return payload;
  }

  public async [Method.GetMany](payload: Payloads.GetMany<StoredValue>): Promise<Payloads.GetMany<StoredValue>> {
    const { provider } = this.context;
    const { keys } = payload;

    for (const key of keys) await this.ensureCachedEntry(key);

    payload = await provider.getMany(payload);
    await this.clearOverflowedEntries();

    return payload;
  }

  public async [Method.Has](payload: Payloads.Has): Promise<Payloads.Has> {
    const { provider } = this.context;

    payload = await provider.has(payload);

    return payload;
  }

  public async [Method.Inc](payload: Payloads.Inc): Promise<Payloads.Inc> {
    const { provider } = this.context;
    const { key } = payload;

    await this.ensureCachedEntry(key);
    payload = await provider.inc(payload);
    await this.clearOverflowedEntries();

    return payload;
  }

  public async [Method.Keys](payload: Payloads.Keys): Promise<Payloads.Keys> {
    const { provider } = this.context;

    payload = await provider.keys(payload);

    return payload;
  }

  public async [Method.Map]<Value = StoredValue>(payload: Payloads.Map.ByHook<StoredValue, Value>): Promise<Payloads.Map.ByHook<StoredValue, Value>>;
  public async [Method.Map]<Value = StoredValue>(payload: Payloads.Map.ByPath<Value>): Promise<Payloads.Map.ByPath<Value>>;
  public async [Method.Map]<Value = StoredValue>(payload: Payloads.Map<StoredValue, Value>): Promise<Payloads.Map<StoredValue, Value>> {
    const { provider } = this.context;

    payload = await provider.map(payload);

    return payload;
  }

  public async [Method.Math](payload: Payloads.Math): Promise<Payloads.Math> {
    const { provider } = this.context;
    const { key } = payload;

    await this.ensureCachedEntry(key);
    payload = await provider.math(payload);
    await this.clearOverflowedEntries();

    return payload;
  }

  public async [Method.Partition](payload: Payloads.Partition.ByHook<StoredValue>): Promise<Payloads.Partition.ByHook<StoredValue>>;
  public async [Method.Partition](payload: Payloads.Partition.ByValue<StoredValue>): Promise<Payloads.Partition.ByValue<StoredValue>>;
  public async [Method.Partition](payload: Payloads.Partition<StoredValue>): Promise<Payloads.Partition<StoredValue>> {
    const { provider } = this.context;

    payload = await provider.partition(payload);

    return payload;
  }

  public async [Method.Push]<Value>(payload: Payloads.Push<Value>): Promise<Payloads.Push<Value>> {
    const { provider } = this.context;
    const { key } = payload;

    await this.ensureCachedEntry(key);
    payload = await provider.push(payload);
    await this.clearOverflowedEntries();

    return payload;
  }

  public async [Method.Random](payload: Payloads.Random<StoredValue>): Promise<Payloads.Random<StoredValue>> {
    const { provider } = this.context;

    payload = await provider.random(payload);

    return payload;
  }

  public async [Method.RandomKey](payload: Payloads.RandomKey): Promise<Payloads.RandomKey> {
    const { provider } = this.context;

    payload = await provider.randomKey(payload);

    return payload;
  }

  public async [Method.Remove]<Value = StoredValue>(payload: Payloads.Remove.ByHook<Value>): Promise<Payloads.Remove.ByHook<Value>>;
  public async [Method.Remove](payload: Payloads.Remove.ByValue): Promise<Payloads.Remove.ByValue>;
  public async [Method.Remove]<Value = StoredValue>(payload: Payloads.Remove<Value>): Promise<Payloads.Remove<Value>> {
    const { provider } = this.context;
    const { key } = payload;

    await this.ensureCachedEntry(key);
    payload = await provider.remove(payload);
    await this.clearOverflowedEntries();

    return payload;
  }

  public async [Method.Set]<Value = StoredValue>(payload: Payloads.Set<Value>): Promise<Payloads.Set<Value>> {
    const { provider } = this.context;
    const { key } = payload;

    await this.ensureCachedEntry(key);
    payload = await provider.set(payload);
    await this.clearOverflowedEntries();

    return payload;
  }

  public async [Method.SetMany]<Value = StoredValue>(payload: Payloads.SetMany<Value>): Promise<Payloads.SetMany<Value>> {
    const { provider } = this.context;
    const { entries } = payload;

    for (const [{ key }] of entries) await this.ensureCachedEntry(key);

    payload = await provider.setMany(payload);
    await this.clearOverflowedEntries();

    return payload;
  }

  public async [Method.Size](payload: Payloads.Size): Promise<Payloads.Size> {
    const { provider } = this.context;

    payload = await provider.size(payload);
    await this.clearOverflowedEntries();

    return payload;
  }

  public async [Method.Some]<Value = StoredValue>(payload: Payloads.Some.ByHook<Value>): Promise<Payloads.Some.ByHook<Value>>;
  public async [Method.Some](payload: Payloads.Some.ByValue): Promise<Payloads.Some.ByValue>;
  public async [Method.Some]<Value = StoredValue>(payload: Payloads.Some<Value>): Promise<Payloads.Some<Value>> {
    const { provider } = this.context;

    payload = await provider.some(payload);

    return payload;
  }

  public async [Method.Update]<Value = StoredValue>(payload: Payloads.Update<StoredValue, Value>): Promise<Payloads.Update<StoredValue, Value>> {
    const { provider } = this.context;
    const { key } = payload;

    await this.ensureCachedEntry(key);
    payload = await provider.update(payload);
    await this.clearOverflowedEntries();

    return payload;
  }

  public async [Method.Values](payload: Payloads.Values<StoredValue>): Promise<Payloads.Values<StoredValue>> {
    const { provider } = this.context;

    payload = await provider.values(payload);

    return payload;
  }

  private async addCachedEntry(key: string, value: StoredValue): Promise<void> {
    const { maxAge, provider } = this.context;

    await provider.set({ method: Method.Set, key, path: [], value });

    if (maxAge > 0)
      this.entries.set(key, {
        ageTimestamp: Date.now(),
        timeout: setTimeout(this.deleteCachedEntry.bind(null, key), maxAge)
      });
  }

  private async ensureCachedEntry(key: string): Promise<void> {
    const { provider } = this.context;

    if (
      !(await provider.has({ method: Method.Has, key, path: [], data: false })).data &&
      (await this.provider.has({ method: Method.Has, key, path: [], data: false })).data
    )
      await this.addCachedEntry(key, (await provider.get<StoredValue>({ method: Method.Get, key, path: [] })).data!);
  }

  private async deleteCachedEntry(key: string, entry?: CoreCache.Entry): Promise<void> {
    const { provider } = this.context;

    await provider.delete({ method: Method.Delete, key, path: [] });

    entry ??= this.entries.get(key);

    if (entry) {
      clearTimeout(entry.timeout);

      this.entries.delete(key);
    }
  }

  private async clearCachedEntries(): Promise<void> {
    const { provider } = this.context;

    for (const [, entry] of this.entries) clearTimeout(entry.timeout);

    await provider.clear({ method: Method.Clear });

    this.entries.clear();
  }

  private async clearOverflowedEntries(): Promise<void> {
    const { maxSize } = this.context;

    if (this.entries.size > maxSize) {
      const entries = Array.from(this.entries.entries());

      for (const [key, entry] of entries.sort(([, a], [, b]) => a.ageTimestamp - b.ageTimestamp).slice(maxSize, entries.length - 1)) {
        await this.deleteCachedEntry(key, entry);

        clearTimeout(entry.timeout);
      }
    }
  }
}

export namespace CoreCache {
  export interface ContextData<StoredValue = unknown> extends Middleware.ContextData {
    maxSize: number;

    maxAge: number;

    provider: JoshProvider<StoredValue>;
  }

  export interface Entry {
    ageTimestamp: number;

    timeout: NodeJS.Timeout;
  }
}
