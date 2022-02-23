import { deleteFromObject, getFromObject, hasFromObject, setToObject } from '@realware/utilities';
import { isNumber, isPrimitive } from '@sapphire/utilities';
import {
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
  isRemoveByHookPayload,
  isRemoveByValuePayload,
  isSomeByHookPayload,
  isSomeByValuePayload
} from '../../functions/validators';
import { MathOperator, Method, Payloads } from '../../types';
import { JoshProvider } from '../JoshProvider';

/**
 * A provider that uses the Node.js native [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) class.
 * @since 2.0.0
 */
export class MapProvider<StoredValue = unknown> extends JoshProvider<StoredValue> {
  /**
   * The [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) cache to store data.
   * @since 2.0.0
   * @private
   */
  private cache = new Map<string, StoredValue>();

  /**
   * A simple cache for the {@link MapProvider.autoKey} method.
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
    const { data } = this.get({ method: Method.Get, key, path });

    if (data === undefined) {
      payload.error = this.error({
        identifier: JoshProvider.CommonIdentifiers.DecMissingData,
        message: path.length === 0 ? `The data at "${key}" does not exist.` : `The data at "${key}.${path.join('.')}" does not exist.`,
        method: Method.Dec
      });

      return payload;
    }

    if (typeof data !== 'number') {
      payload.error = this.error({
        identifier: JoshProvider.CommonIdentifiers.DecInvalidType,
        message:
          path.length === 0 ? `The data at "${key}" must be of type "number".` : `The data at "${key}.${path.join('.')}" must be of type "number".`,
        method: Method.Dec
      });

      return payload;
    }

    this.set({ method: Method.Set, key, path, value: data - 1 });

    return payload;
  }

  public [Method.Delete](payload: Payloads.Delete): Payloads.Delete {
    const { key, path } = payload;

    if (path.length === 0) {
      this.cache.delete(key);

      return payload;
    }

    if (this.has({ method: Method.Has, key, path }).data) {
      deleteFromObject(this.cache.get(key), path);

      return payload;
    }

    return payload;
  }

  public [Method.DeleteMany](payload: Payloads.DeleteMany): Payloads.DeleteMany {
    const { keys } = payload;

    for (const key of keys) this.cache.delete(key);

    return payload;
  }

  public [Method.Ensure](payload: Payloads.Ensure<StoredValue>): Payloads.Ensure<StoredValue> {
    const { key } = payload;

    if (!this.cache.has(key)) this.cache.set(key, payload.defaultValue);

    Reflect.set(payload, 'data', this.cache.get(key));

    return payload;
  }

  public async [Method.Every](payload: Payloads.Every.ByHook<StoredValue>): Promise<Payloads.Every.ByHook<StoredValue>>;
  public async [Method.Every](payload: Payloads.Every.ByValue): Promise<Payloads.Every.ByValue>;
  public async [Method.Every](payload: Payloads.Every<StoredValue>): Promise<Payloads.Every<StoredValue>> {
    payload.data = true;

    if (this.cache.size === 0) {
      payload.data = false;

      return payload;
    }

    if (isEveryByHookPayload(payload)) {
      const { hook } = payload;

      for (const value of this.cache.values()) {
        const everyValue = await hook(value);

        if (everyValue) continue;

        payload.data = false;
      }
    }

    if (isEveryByValuePayload(payload)) {
      const { path, value } = payload;

      for (const key of this.cache.keys()) {
        const { data } = this.get({ method: Method.Get, key, path });

        if (value === data) continue;

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

      for (const [key, value] of this.cache.entries()) {
        const filterValue = await hook(value);

        if (!filterValue) continue;

        payload.data[key] = value;
      }
    }

    if (isFilterByValuePayload(payload)) {
      const { path, value } = payload;

      if (!isPrimitive(value)) {
        payload.error = this.error({
          identifier: JoshProvider.CommonIdentifiers.FilterInvalidValue,
          message: 'The "value" must be a primitive type.',
          method: Method.Filter
        });

        return payload;
      }

      for (const [key, storedValue] of this.cache.entries())
        if (value === (path.length === 0 ? storedValue : getFromObject(storedValue, path))) payload.data[key] = storedValue;
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
        const foundValue = await hook(value);

        if (!foundValue) continue;

        payload.data = [key, value];

        break;
      }
    }

    if (isFindByValuePayload(payload)) {
      const { path, value } = payload;

      if (!isPrimitive(value)) {
        payload.error = this.error({
          identifier: JoshProvider.CommonIdentifiers.FindInvalidValue,
          message: 'The "value" must be of type primitive.',
          method: Method.Find
        });

        return payload;
      }

      for (const [key, storedValue] of this.cache.entries()) {
        if (payload.data[0] !== null && payload.data[1] !== null) break;
        if (value === (path.length === 0 ? storedValue : getFromObject(storedValue, path))) payload.data = [key, storedValue];
      }
    }

    return payload;
  }

  public [Method.Get]<Value = StoredValue>(payload: Payloads.Get<Value>): Payloads.Get<Value> {
    const { key, path } = payload;

    Reflect.set(payload, 'data', path.length === 0 ? this.cache.get(key) : getFromObject(this.cache.get(key), path));

    return payload;
  }

  public [Method.GetAll](payload: Payloads.GetAll<StoredValue>): Payloads.GetAll<StoredValue> {
    payload.data = {};

    for (const [key, value] of this.cache.entries()) payload.data[key] = value;

    return payload;
  }

  public [Method.GetMany](payload: Payloads.GetMany<StoredValue>): Payloads.GetMany<StoredValue> {
    const { keys } = payload;

    payload.data = {};

    for (const key of keys) payload.data[key] = this.cache.get(key) ?? null;

    return payload;
  }

  public [Method.Has](payload: Payloads.Has): Payloads.Has {
    const { key, path } = payload;

    payload.data = this.cache.has(key) ? (path.length === 0 ? true : hasFromObject(this.cache.get(key)!, path)) : false;

    return payload;
  }

  public [Method.Inc](payload: Payloads.Inc): Payloads.Inc {
    const { key, path } = payload;
    const { data } = this.get({ method: Method.Get, key, path });

    if (data === undefined) {
      payload.error = this.error({
        identifier: JoshProvider.CommonIdentifiers.IncMissingData,
        message: path.length === 0 ? `The data at "${key}" does not exist.` : `The data at "${key}.${path.join('.')}" does not exist.`,
        method: Method.Inc
      });

      return payload;
    }

    if (typeof data !== 'number') {
      payload.error = this.error({
        identifier: JoshProvider.CommonIdentifiers.IncInvalidType,
        message:
          path.length === 0 ? `The data at "${key}" must be of type "number".` : `The data at "${key}.${path.join('.')}" must be of type "number".`,
        method: Method.Inc
      });

      return payload;
    }

    this.set({ method: Method.Set, key, path, value: data + 1 });

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

      // @ts-expect-error 2345
      for (const value of this.cache.values()) payload.data.push(path.length === 0 ? value : getFromObject(value, path));
    }

    return payload;
  }

  public [Method.Math](payload: Payloads.Math): Payloads.Math {
    const { key, path, operator, operand } = payload;
    let { data } = this.get<number>({ method: Method.Get, key, path });

    if (data === undefined) {
      payload.error = this.error({
        identifier: JoshProvider.CommonIdentifiers.MathMissingData,
        message: path.length === 0 ? `The data at "${key}" does not exist.` : `The data at "${key}.${path.join('.')}" does not exist.`,
        method: Method.Math
      });

      return payload;
    }

    if (!isNumber(data)) {
      payload.error = this.error({
        identifier: JoshProvider.CommonIdentifiers.MathInvalidType,
        message: path.length === 0 ? `The data at "${key}" must be a number.` : `The data at "${key}.${path.join('.')}" must be a number.`,
        method: Method.Math
      });

      return payload;
    }

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

    this.set({ method: Method.Set, key, path, value: data });

    return payload;
  }

  public async [Method.Partition](payload: Payloads.Partition.ByHook<StoredValue>): Promise<Payloads.Partition.ByHook<StoredValue>>;
  public async [Method.Partition](payload: Payloads.Partition.ByValue<StoredValue>): Promise<Payloads.Partition.ByValue<StoredValue>>;
  public async [Method.Partition](payload: Payloads.Partition<StoredValue>): Promise<Payloads.Partition<StoredValue>> {
    payload.data = { truthy: {}, falsy: {} };

    if (isPartitionByHookPayload(payload)) {
      const { hook } = payload;

      for (const [key, value] of this.cache.entries()) {
        const filterValue = await hook(value);

        if (filterValue) payload.data.truthy[key] = value;
        else payload.data.falsy[key] = value;
      }
    }

    if (isPartitionByValuePayload(payload)) {
      const { path, value } = payload;

      if (!isPrimitive(value)) {
        payload.error = this.error({
          identifier: JoshProvider.CommonIdentifiers.PartitionInvalidValue,
          message: 'The "value" must be a primitive type.',
          method: Method.Partition
        });

        return payload;
      }

      for (const [key, storedValue] of this.cache.entries())
        if (value === (path.length === 0 ? storedValue : getFromObject(storedValue, path))) payload.data.truthy[key] = storedValue;
        else payload.data.falsy[key] = storedValue;
    }

    return payload;
  }

  public [Method.Push]<Value = StoredValue>(payload: Payloads.Push<Value>): Payloads.Push<Value> {
    const { key, path, value } = payload;
    const { data } = this.get({ method: Method.Get, key, path });

    if (data === undefined) {
      payload.error = this.error({
        identifier: JoshProvider.CommonIdentifiers.PushMissingData,
        message: path.length === 0 ? `The data at "${key}" does not exist.` : `The data at "${key}.${path.join('.')}" does not exist.`,
        method: Method.Push
      });

      return payload;
    }

    if (!Array.isArray(data)) {
      payload.error = this.error({
        identifier: JoshProvider.CommonIdentifiers.PushInvalidType,
        message: path.length === 0 ? `The data at "${key}" must be an array.` : `The data at "${key}.${path.join('.')}" does not exist.`,
        method: Method.Push
      });

      return payload;
    }

    data.push(value);

    this.set({ method: Method.Set, key, path, value: data });

    return payload;
  }

  public [Method.Random](payload: Payloads.Random<StoredValue>): Payloads.Random<StoredValue> {
    const { count, duplicates } = payload;

    if (this.cache.size === 0) return payload;
    if (this.cache.size < count) {
      payload.error = this.error({
        identifier: JoshProvider.CommonIdentifiers.RandomInvalidCount,
        message: `The count of values to be selected must be less than or equal to the number of values in the map.`,
        method: Method.Random
      });

      return payload;
    }

    const data: [string, StoredValue][] = [];
    const entries = Array.from(this.cache.entries());

    for (let i = 0; i < count; i++)
      data.push(duplicates ? entries[Math.floor(Math.random() & entries.length)] : this.randomEntriesWithoutDuplicates(data));

    payload.data = data.map(([, value]) => value);

    return payload;
  }

  public [Method.RandomKey](payload: Payloads.RandomKey): Payloads.RandomKey {
    const { count, duplicates } = payload;

    if (this.cache.size === 0) return payload;
    if (this.cache.size < count) {
      payload.error = this.error({
        identifier: JoshProvider.CommonIdentifiers.RandomKeyInvalidCount,
        message: `The count of keys to be selected must be less than or equal to the number of keys in the map.`,
        method: Method.RandomKey
      });

      return payload;
    }

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
      const { data } = this.get<unknown[]>({ method: Method.Get, key, path });

      if (data === undefined) {
        payload.error = this.error({
          identifier: JoshProvider.CommonIdentifiers.RemoveMissingData,
          message: path.length === 0 ? `The data at "${key}" does not exist.` : `The data at "${key}.${path.join('.')}" does not exist.`,
          method: Method.Remove
        });

        return payload;
      }

      if (!Array.isArray(data)) {
        payload.error = this.error({
          identifier: JoshProvider.CommonIdentifiers.RemoveInvalidType,
          message: path.length === 0 ? `The data at "${key}" must be an array.` : `The data at "${key}.${path.join('.')}" must be an array.`,
          method: Method.Remove
        });

        return payload;
      }

      const filterValues = await Promise.all(data.map(hook));

      this.set({ method: Method.Set, key, path, value: data.filter((_, index) => !filterValues[index]) });
    }

    if (isRemoveByValuePayload(payload)) {
      const { key, path, value } = payload;
      const { data } = this.get({ method: Method.Get, key, path });

      if (data === undefined) {
        payload.error = this.error({
          identifier: JoshProvider.CommonIdentifiers.RemoveMissingData,
          message: path.length === 0 ? `The data at "${key}" does not exist.` : `The data at "${key}.${path.join('.')}" does not exist.`,
          method: Method.Remove
        });

        return payload;
      }

      if (!Array.isArray(data)) {
        payload.error = this.error({
          identifier: JoshProvider.CommonIdentifiers.RemoveInvalidType,
          message: path.length === 0 ? `The data at "${key}" must be an array.` : `The data at "${key}.${path.join('.')}" must be an array.`,
          method: Method.Remove
        });

        return payload;
      }

      this.set({ method: Method.Set, key, path, value: data.filter((storedValue) => value !== storedValue) });
    }

    return payload;
  }

  public [Method.Set]<Value = StoredValue>(payload: Payloads.Set<Value>): Payloads.Set<Value> {
    const { key, path, value } = payload;

    // @ts-expect-error 2345
    if (path.length === 0) this.cache.set(key, value);
    else {
      const storedValue = this.cache.get(key);

      this.cache.set(key, setToObject(storedValue ?? {}, path, value));
    }

    return payload;
  }

  public [Method.SetMany]<Value = StoredValue>(payload: Payloads.SetMany<Value>): Payloads.SetMany<Value> {
    const { entries, overwrite } = payload;

    for (const [{ key, path }, value] of entries)
      if (overwrite) this.set({ method: Method.Set, key, path, value });
      else if (!this.has({ method: Method.Has, key, path }).data) this.set({ method: Method.Set, key, path, value });

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
        const someValue = await hook(value);

        if (!someValue) continue;

        payload.data = true;

        break;
      }
    }

    if (isSomeByValuePayload(payload)) {
      const { path, value } = payload;

      for (const storedValue of this.cache.values()) {
        if (path.length !== 0 && value !== getFromObject(storedValue, path)) continue;
        if (isPrimitive(storedValue) && value === storedValue) continue;

        payload.data = true;
      }
    }

    return payload;
  }

  public async [Method.Update]<Value = StoredValue>(payload: Payloads.Update<StoredValue, Value>): Promise<Payloads.Update<StoredValue, Value>> {
    const { key, path, hook } = payload;
    const { data } = this.get({ method: Method.Get, key, path });

    if (data === undefined) return payload;

    this.set({ method: Method.Set, key, path, value: await hook(data) });

    return payload;
  }

  public [Method.Values](payload: Payloads.Values<StoredValue>): Payloads.Values<StoredValue> {
    Reflect.set(payload, 'data', Array.from(this.cache.values()));

    return payload;
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
