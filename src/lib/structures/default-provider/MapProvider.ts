import {
  CommonIdentifiers,
  isEveryByHookPayload,
  isEveryByValuePayload,
  isFilterByHookPayload,
  isFilterByValuePayload,
  isFindByHookPayload,
  isFindByValuePayload,
  isMapByHookPayload,
  isMapByPathPayload,
  isPartitionByHookPayload,
  isPartitionByValuePayload,
  isPayloadWithData,
  isRemoveByHookPayload,
  isRemoveByValuePayload,
  isSomeByHookPayload,
  isSomeByValuePayload,
  JoshProvider,
  MathOperator,
  Method,
  Payloads
} from '@joshdb/provider';
import { isPrimitive } from '@sapphire/utilities';
import { deleteProperty, getProperty, hasProperty, PROPERTY_NOT_FOUND, setProperty } from 'property-helpers';

/**
 * A provider that uses the Node.js native [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) class.
 * @since 2.0.0
 */
export class MapProvider<StoredValue = unknown> extends JoshProvider<StoredValue> {
  public version = { major: 2, minor: 0, patch: 0 };

  /**
   * The [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) cache to store data.
   * @since 2.0.0
   */
  private cache = new Map<string, StoredValue>();

  /**
   * A simple cache for the autoKey method.
   * @since 2.0.0
   */
  private autoKeyCount = 0;

  public [Method.AutoKey](payload: Payloads.AutoKey): Payloads.AutoKey {
    this.autoKeyCount++;
    payload.data = this.autoKeyCount.toString();

    return payload;
  }

  public [Method.Clear](payload: Payloads.Clear): Payloads.Clear {
    this.cache.clear();
    this.autoKeyCount = 0;

    return payload;
  }

  public [Method.Dec](payload: Payloads.Dec): Payloads.Dec {
    const { key, path } = payload;
    const getPayload = this[Method.Get]({ method: Method.Get, key, path });

    if (!isPayloadWithData(getPayload))
      return { ...payload, error: this.error({ identifier: CommonIdentifiers.MissingData, method: Method.Dec }, { key, path }) };

    const { data } = getPayload;

    if (typeof data !== 'number')
      return { ...payload, error: this.error({ identifier: CommonIdentifiers.InvalidDataType, method: Method.Dec }, { key, path, type: 'number' }) };

    this[Method.Set]({ method: Method.Set, key, path, value: data - 1 });

    return payload;
  }

  public [Method.Delete](payload: Payloads.Delete): Payloads.Delete {
    const { key, path } = payload;

    if (path.length === 0) this.cache.delete(key);
    else if (this[Method.Has]({ ...payload, method: Method.Has }).data) deleteProperty(this.cache.get(key), path);

    return payload;
  }

  public [Method.DeleteMany](payload: Payloads.DeleteMany): Payloads.DeleteMany {
    const { keys } = payload;

    for (const key of keys) this.cache.delete(key);

    return payload;
  }

  public async [Method.Each](payload: Payloads.Each<StoredValue>): Promise<Payloads.Each<StoredValue>> {
    const { hook } = payload;

    for (const key of this.cache.keys()) await hook(this.cache.get(key)!, key);

    return payload;
  }

  public [Method.Ensure](payload: Payloads.Ensure<StoredValue>): Payloads.Ensure<StoredValue> {
    const { key, defaultValue } = payload;

    payload.data = defaultValue;

    if (this.cache.has(key)) payload.data = this.cache.get(key);
    else this.cache.set(key, defaultValue);

    return payload;
  }

  public [Method.Entries](payload: Payloads.Entries<StoredValue>): Payloads.Entries<StoredValue> {
    payload.data = Array.from(this.cache.entries()).reduce((data, [key, value]) => ({ ...data, [key]: value }), {});

    return payload;
  }

  public async [Method.Every](payload: Payloads.Every.ByHook<StoredValue>): Promise<Payloads.Every.ByHook<StoredValue>>;
  public async [Method.Every](payload: Payloads.Every.ByValue): Promise<Payloads.Every.ByValue>;
  public async [Method.Every](payload: Payloads.Every<StoredValue>): Promise<Payloads.Every<StoredValue>> {
    payload.data = true;

    if (this.cache.size === 0) return payload;
    if (isEveryByHookPayload(payload)) {
      const { hook } = payload;

      for (const value of this.cache.values()) {
        const result = await hook(value);

        if (result) continue;

        payload.data = false;
      }
    }

    if (isEveryByValuePayload(payload)) {
      const { path, value } = payload;

      for (const [key, storedValue] of this.cache.entries()) {
        const data = getProperty(storedValue, path, false);

        if (data === PROPERTY_NOT_FOUND)
          return { ...payload, error: this.error({ identifier: CommonIdentifiers.MissingData, method: Method.Every }, { key, path }) };
        if (!isPrimitive(data))
          return {
            ...payload,
            error: this.error({ identifier: CommonIdentifiers.InvalidDataType, method: Method.Every }, { key, path, type: 'primitive' })
          };
        if (data === value) continue;

        payload.data = false;
      }
    }

    return payload;
  }

  public async [Method.Filter](payload: Payloads.Filter.ByHook<StoredValue>): Promise<Payloads.Filter.ByHook<StoredValue>>;
  public async [Method.Filter](payload: Payloads.Filter.ByValue<StoredValue>): Promise<Payloads.Filter.ByValue<StoredValue>>;
  public async [Method.Filter](payload: Payloads.Filter<StoredValue>): Promise<Payloads.Filter<StoredValue>> {
    payload.data = {};

    if (isFilterByHookPayload(payload)) {
      const { hook } = payload;

      for (const [key, value] of this.cache.entries()) if (await hook(value)) payload.data[key] = value;
    }

    if (isFilterByValuePayload(payload)) {
      const { path, value } = payload;

      for (const [key, storedValue] of this.cache.entries()) {
        const data = getProperty(storedValue, path, false);

        if (data === PROPERTY_NOT_FOUND)
          return { ...payload, error: this.error({ identifier: CommonIdentifiers.MissingData, method: Method.Filter }, { key, path }) };
        if (!isPrimitive(data))
          return {
            ...payload,
            error: this.error({ identifier: CommonIdentifiers.InvalidDataType, method: Method.Filter }, { key, path, type: 'primitive' })
          };
        if (data === value) payload.data[key] = storedValue;
      }
    }

    return payload;
  }

  public async [Method.Find](payload: Payloads.Find.ByHook<StoredValue>): Promise<Payloads.Find.ByHook<StoredValue>>;
  public async [Method.Find](payload: Payloads.Find.ByValue<StoredValue>): Promise<Payloads.Find.ByValue<StoredValue>>;
  public async [Method.Find](payload: Payloads.Find<StoredValue>): Promise<Payloads.Find<StoredValue>> {
    payload.data = [null, null];

    if (isFindByHookPayload(payload)) {
      const { hook } = payload;

      for (const [key, value] of this.cache.entries()) {
        const result = await hook(value);

        if (!result) continue;

        payload.data = [key, value];

        break;
      }
    }

    if (isFindByValuePayload(payload)) {
      const { path, value } = payload;

      if (!isPrimitive(value)) {
        payload.error = this.error({ identifier: CommonIdentifiers.InvalidValueType, method: Method.Find }, { type: 'primitive' });

        return payload;
      }

      for (const [key, storedValue] of this.cache.entries()) {
        if (payload.data[0] !== null && payload.data[1] !== null) break;

        const data = getProperty(storedValue, path, false);

        if (data === PROPERTY_NOT_FOUND)
          return { ...payload, error: this.error({ identifier: CommonIdentifiers.MissingData, method: Method.Find }, { key, path }) };
        if (!isPrimitive(data))
          return {
            ...payload,
            error: this.error({ identifier: CommonIdentifiers.InvalidDataType, method: Method.Find }, { key, path, type: 'primitive' })
          };
        if (data !== value) continue;

        payload.data = [key, storedValue];

        break;
      }
    }

    return payload;
  }

  public [Method.Get]<Value = StoredValue>(payload: Payloads.Get<Value>): Payloads.Get<Value> {
    const { key, path } = payload;

    if (path.length === 0) {
      if (this.cache.has(key)) payload.data = this.cache.get(key) as unknown as Value;
    } else {
      const data = getProperty<Value>(this.cache.get(key), path);

      if (data !== PROPERTY_NOT_FOUND) payload.data = data;
    }

    return payload;
  }

  public [Method.GetMany](payload: Payloads.GetMany<StoredValue>): Payloads.GetMany<StoredValue> {
    const { keys } = payload;

    payload.data = keys.reduce((data, key) => ({ ...data, [key]: this.cache.has(key) ? this.cache.get(key) : null }), {});

    return payload;
  }

  public [Method.Has](payload: Payloads.Has): Payloads.Has {
    const { key, path } = payload;

    payload.data = this.cache.has(key) && hasProperty(this.cache.get(key), path);

    return payload;
  }

  public [Method.Inc](payload: Payloads.Inc): Payloads.Inc {
    const { key, path } = payload;
    const getPayload = this[Method.Get]({ method: Method.Get, key, path });

    if (!isPayloadWithData(getPayload))
      return { ...payload, error: this.error({ identifier: CommonIdentifiers.MissingData, method: Method.Inc }, { key, path }) };

    const { data } = getPayload;

    if (typeof data !== 'number')
      return { ...payload, error: this.error({ identifier: CommonIdentifiers.InvalidDataType, method: Method.Inc }, { key, path, type: 'number' }) };

    this[Method.Set]({ method: Method.Set, key, path, value: data + 1 });

    return payload;
  }

  public [Method.Keys](payload: Payloads.Keys): Payloads.Keys {
    payload.data = Array.from(this.cache.keys());

    return payload;
  }

  public async [Method.Map]<Value = StoredValue>(payload: Payloads.Map.ByHook<StoredValue, Value>): Promise<Payloads.Map.ByHook<StoredValue, Value>>;
  public async [Method.Map]<Value = StoredValue>(payload: Payloads.Map.ByPath<Value>): Promise<Payloads.Map.ByPath<Value>>;
  public async [Method.Map]<Value = StoredValue>(payload: Payloads.Map<StoredValue, Value>): Promise<Payloads.Map<StoredValue, Value>> {
    payload.data = [];

    if (isMapByHookPayload(payload)) {
      const { hook } = payload;

      for (const value of this.cache.values()) payload.data.push(await hook(value));
    }

    if (isMapByPathPayload(payload)) {
      const { path } = payload;

      for (const value of this.cache.values()) {
        const data = getProperty<Value>(value, path);

        if (data !== PROPERTY_NOT_FOUND) payload.data.push(data);
      }
    }

    return payload;
  }

  public [Method.Math](payload: Payloads.Math): Payloads.Math {
    const { key, path, operator, operand } = payload;
    const getPayload = this[Method.Get]<number>({ method: Method.Get, key, path });

    if (!isPayloadWithData(getPayload))
      return { ...payload, error: this.error({ identifier: CommonIdentifiers.MissingData, method: Method.Math }, { key, path }) };

    let { data } = getPayload;

    if (typeof data !== 'number')
      return { ...payload, error: this.error({ identifier: CommonIdentifiers.InvalidDataType, method: Method.Math }, { key, path, type: 'number' }) };

    switch (operator) {
      case MathOperator.Addition:
        data += operand;

        break;

      case MathOperator.Subtraction:
        data -= operand;

        break;

      case MathOperator.Multiplication:
        data *= operand;

        break;

      case MathOperator.Division:
        data /= operand;

        break;

      case MathOperator.Remainder:
        data %= operand;

        break;

      case MathOperator.Exponent:
        data **= operand;

        break;
    }

    this[Method.Set]({ method: Method.Set, key, path, value: data });

    return payload;
  }

  public async [Method.Partition](payload: Payloads.Partition.ByHook<StoredValue>): Promise<Payloads.Partition.ByHook<StoredValue>>;
  public async [Method.Partition](payload: Payloads.Partition.ByValue<StoredValue>): Promise<Payloads.Partition.ByValue<StoredValue>>;
  public async [Method.Partition](payload: Payloads.Partition<StoredValue>): Promise<Payloads.Partition<StoredValue>> {
    payload.data = { truthy: {}, falsy: {} };

    if (isPartitionByHookPayload(payload)) {
      const { hook } = payload;

      for (const [key, value] of this.cache.entries()) {
        const result = await hook(value);

        if (result) payload.data.truthy[key] = value;
        else payload.data.falsy[key] = value;
      }
    }

    if (isPartitionByValuePayload(payload)) {
      const { path, value } = payload;

      for (const [key, storedValue] of this.cache.entries()) {
        const data = getProperty<StoredValue>(storedValue, path);

        if (data === PROPERTY_NOT_FOUND)
          return { ...payload, error: this.error({ identifier: CommonIdentifiers.MissingData, method: Method.Partition }, { key, path }) };
        if (!isPrimitive(data))
          return {
            ...payload,
            error: this.error({ identifier: CommonIdentifiers.InvalidDataType, method: Method.Partition }, { key, path, type: 'primitive' })
          };
        if (value === data) payload.data.truthy[key] = storedValue;
        else payload.data.falsy[key] = storedValue;
      }
    }

    return payload;
  }

  public [Method.Push]<Value = StoredValue>(payload: Payloads.Push<Value>): Payloads.Push<Value> {
    const { key, path, value } = payload;
    const getPayload = this[Method.Get]({ method: Method.Get, key, path });

    if (!isPayloadWithData(getPayload))
      return { ...payload, error: this.error({ identifier: CommonIdentifiers.MissingData, method: Method.Push }, { key, path }) };

    const { data } = getPayload;

    if (!Array.isArray(data))
      return { ...payload, error: this.error({ identifier: CommonIdentifiers.InvalidDataType, method: Method.Push }, { key, path, type: 'array' }) };

    data.push(value);
    this[Method.Set]({ method: Method.Set, key, path, value: data });

    return payload;
  }

  public [Method.Random](payload: Payloads.Random<StoredValue>): Payloads.Random<StoredValue> {
    if (this.cache.size === 0) return payload;

    const { count, duplicates } = payload;

    if (this.cache.size < count)
      return {
        ...payload,
        error: this.error({ identifier: CommonIdentifiers.InvalidCount, method: Method.Random })
      };

    const data: [string, StoredValue][] = [];
    const entries = Array.from(this.cache.entries());

    for (let i = 0; i < count; i++)
      data.push(duplicates ? entries[Math.floor(Math.random() & entries.length)] : this.randomEntriesWithoutDuplicates(data));

    payload.data = data.map(([, value]) => value);

    return payload;
  }

  public [Method.RandomKey](payload: Payloads.RandomKey): Payloads.RandomKey {
    if (this.cache.size === 0) return payload;

    const { count, duplicates } = payload;

    if (this.cache.size < count)
      return {
        ...payload,
        error: this.error({ identifier: CommonIdentifiers.InvalidCount, method: Method.RandomKey })
      };

    payload.data = [];

    const keys = Array.from(this.cache.keys());

    for (let i = 0; i < count; i++)
      payload.data.push(duplicates ? keys[Math.floor(Math.random() * keys.length)] : this.randomKeyWithoutDuplicates(payload.data));

    return payload;
  }

  public async [Method.Remove]<Value = StoredValue>(payload: Payloads.Remove.ByHook<Value>): Promise<Payloads.Remove.ByHook<Value>>;
  public async [Method.Remove](payload: Payloads.Remove.ByValue): Promise<Payloads.Remove.ByValue>;
  public async [Method.Remove]<Value = StoredValue>(payload: Payloads.Remove<Value>): Promise<Payloads.Remove<Value>> {
    if (isRemoveByHookPayload(payload)) {
      const { key, path, hook } = payload;
      const getPayload = this[Method.Get]<Value[]>({ method: Method.Get, key, path });

      if (!isPayloadWithData(getPayload))
        return { ...payload, error: this.error({ identifier: CommonIdentifiers.MissingData, method: Method.Remove }, { key, path }) };

      const { data } = getPayload;

      if (!Array.isArray(data))
        return {
          ...payload,
          error: this.error({ identifier: CommonIdentifiers.InvalidDataType, method: Method.Remove }, { key, path, type: 'array' })
        };

      const filterValues = await Promise.all(data.map(hook));

      this[Method.Set]({ method: Method.Set, key, path, value: data.filter((_, index) => !filterValues[index]) });
    }

    if (isRemoveByValuePayload(payload)) {
      const { key, path, value } = payload;
      const getPayload = this[Method.Get]({ method: Method.Get, key, path });

      if (!isPayloadWithData(getPayload))
        return { ...payload, error: this.error({ identifier: CommonIdentifiers.MissingData, method: Method.Remove }, { key, path }) };

      const { data } = getPayload;

      if (!Array.isArray(data))
        return {
          ...payload,
          error: this.error({ identifier: CommonIdentifiers.InvalidDataType, method: Method.Remove }, { key, path, type: 'array' })
        };

      this[Method.Set]({ method: Method.Set, key, path, value: data.filter((storedValue) => value !== storedValue) });
    }

    return payload;
  }

  public [Method.Set]<Value = StoredValue>(payload: Payloads.Set<Value>): Payloads.Set<Value> {
    const { key, path, value } = payload;

    if (path.length === 0) this.cache.set(key, value as unknown as StoredValue);
    else {
      const storedValue = this.cache.get(key);

      this.cache.set(key, setProperty(storedValue, path, value));
    }

    return payload;
  }

  public [Method.SetMany](payload: Payloads.SetMany): Payloads.SetMany {
    const { entries, overwrite } = payload;

    for (const [{ key, path }, value] of entries)
      if (overwrite) this[Method.Set]({ method: Method.Set, key, path, value });
      else if (!this[Method.Has]({ method: Method.Has, key, path }).data) this[Method.Set]({ method: Method.Set, key, path, value });

    return payload;
  }

  public [Method.Size](payload: Payloads.Size): Payloads.Size {
    payload.data = this.cache.size;

    return payload;
  }

  public async [Method.Some](payload: Payloads.Some.ByHook<StoredValue>): Promise<Payloads.Some.ByHook<StoredValue>>;
  public async [Method.Some](payload: Payloads.Some.ByValue): Promise<Payloads.Some.ByValue>;
  public async [Method.Some](payload: Payloads.Some<StoredValue>): Promise<Payloads.Some<StoredValue>> {
    payload.data = false;

    if (isSomeByHookPayload(payload)) {
      const { hook } = payload;

      for (const value of this.cache.values()) {
        const result = await hook(value);

        if (!result) continue;

        payload.data = true;

        break;
      }
    }

    if (isSomeByValuePayload(payload)) {
      const { path, value } = payload;

      for (const [key, storedValue] of this.cache.entries()) {
        const data = getProperty(storedValue, path, false);

        if (data === PROPERTY_NOT_FOUND)
          return { ...payload, error: this.error({ identifier: CommonIdentifiers.MissingData, method: Method.Some }, { key, path }) };
        if (!isPrimitive(data))
          return {
            ...payload,
            error: this.error({ identifier: CommonIdentifiers.InvalidDataType, method: Method.Some }, { key, path, type: 'primitive' })
          };
        if (data !== value) continue;

        payload.data = true;

        break;
      }
    }

    return payload;
  }

  public async [Method.Update]<Value = StoredValue>(payload: Payloads.Update<StoredValue, Value>): Promise<Payloads.Update<StoredValue, Value>> {
    const { key, hook } = payload;
    const getPayload = this[Method.Get]({ method: Method.Get, key, path: [] });

    if (!isPayloadWithData<StoredValue>(getPayload))
      return { ...payload, error: this.error({ identifier: CommonIdentifiers.MissingData, method: Method.Update }, { key }) };

    const { data } = getPayload;

    this[Method.Set]({ method: Method.Set, key, path: [], value: await hook(data) });

    return payload;
  }

  public [Method.Values](payload: Payloads.Values<StoredValue>): Payloads.Values<StoredValue> {
    payload.data = Array.from(this.cache.values());

    return payload;
  }

  protected fetchVersion() {
    return this.version;
  }

  private randomEntriesWithoutDuplicates(data: [string, StoredValue][]): [string, StoredValue] {
    const entries = Array.from(this.cache.entries());
    const entry = entries[Math.floor(Math.random() * entries.length)];

    if (data.length === 0) return entry;
    if (isPrimitive(entry[1]) && data.some(([key, value]) => entry[0] === key && entry[1] === value))
      return this.randomEntriesWithoutDuplicates(data);

    return entry;
  }

  private randomKeyWithoutDuplicates(data: string[]): string {
    const keys = Array.from(this.cache.keys());
    const key = keys[Math.floor(Math.random() * keys.length)];

    if (data.length === 0) return key;
    if (data.includes(key)) return this.randomKeyWithoutDuplicates(data);

    return key;
  }
}
