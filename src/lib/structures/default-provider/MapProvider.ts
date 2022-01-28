import { deleteFromObject, getFromObject, hasFromObject, setToObject } from '@realware/utilities';
import { isNumber, isPrimitive } from '@sapphire/utilities';
import type {
  AutoKeyPayload,
  ClearPayload,
  DecPayload,
  DeletePayload,
  EnsurePayload,
  EveryByHookPayload,
  EveryByValuePayload,
  EveryPayload,
  FilterByHookPayload,
  FilterByValuePayload,
  FilterPayload,
  FindByHookPayload,
  FindByValuePayload,
  FindPayload,
  GetAllPayload,
  GetManyPayload,
  GetPayload,
  HasPayload,
  IncPayload,
  KeysPayload,
  MapByHookPayload,
  MapByPathPayload,
  MapPayload,
  MathPayload,
  PartitionByHookPayload,
  PartitionByValuePayload,
  PartitionPayload,
  PushPayload,
  RandomKeyPayload,
  RandomPayload,
  RemoveByHookPayload,
  RemoveByValuePayload,
  RemovePayload,
  SetManyPayload,
  SetPayload,
  SizePayload,
  SomeByHookPayload,
  SomeByValuePayload,
  SomePayload,
  UpdatePayload,
  ValuesPayload
} from '../../payloads';
import { MathOperator, Method } from '../../types';
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
} from '../../validators';
import { JoshProvider } from '../JoshProvider';
import { MapProviderError } from './MapProviderError';

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

  public [Method.AutoKey](payload: AutoKeyPayload): AutoKeyPayload {
    this.autoKeyCount++;

    payload.data = this.autoKeyCount.toString();

    return payload;
  }

  public [Method.Clear](payload: ClearPayload): ClearPayload {
    this.cache.clear();
    this.autoKeyCount = 0;

    return payload;
  }

  public [Method.Dec](payload: DecPayload): DecPayload {
    const { key, path } = payload;
    const { data } = this.get({ method: Method.Get, key, path });

    if (data === undefined) {
      payload.error = new MapProviderError({
        identifier: JoshProvider.CommonIdentifiers.DecMissingData,
        message: path.length === 0 ? `The data at "${key}" does not exist.` : `The data at "${key}.${path.join('.')}" does not exist.`,
        method: Method.Dec
      });

      return payload;
    }

    if (typeof data !== 'number') {
      payload.error = new MapProviderError({
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

  public [Method.Delete](payload: DeletePayload): DeletePayload {
    const { key, path } = payload;

    if (path.length === 0) {
      this.cache.delete(key);

      return payload;
    }

    if (this.has({ method: Method.Has, key, path, data: false }).data) {
      const { data } = this.get({ method: Method.Get, key, path: [] });

      deleteFromObject(data, path);

      return payload;
    }

    return payload;
  }

  public [Method.Ensure](payload: EnsurePayload<StoredValue>): EnsurePayload<StoredValue> {
    const { key } = payload;

    if (!this.cache.has(key)) this.cache.set(key, payload.defaultValue);

    Reflect.set(payload, 'data', this.cache.get(key));

    return payload;
  }

  public async [Method.Every](payload: EveryByHookPayload<StoredValue>): Promise<EveryByHookPayload<StoredValue>>;
  public async [Method.Every](payload: EveryByValuePayload): Promise<EveryByValuePayload>;
  public async [Method.Every](payload: EveryPayload<StoredValue>): Promise<EveryPayload<StoredValue>> {
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

  public async [Method.Filter](payload: FilterByHookPayload<StoredValue>): Promise<FilterByHookPayload<StoredValue>>;
  public async [Method.Filter](payload: FilterByValuePayload<StoredValue>): Promise<FilterByValuePayload<StoredValue>>;
  public async [Method.Filter](payload: FilterPayload<StoredValue>): Promise<FilterPayload<StoredValue>> {
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
        payload.error = new MapProviderError({
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

  public async [Method.Find](payload: FindByHookPayload<StoredValue>): Promise<FindByHookPayload<StoredValue>>;
  public async [Method.Find](payload: FindByValuePayload<StoredValue>): Promise<FindByValuePayload<StoredValue>>;
  public async [Method.Find](payload: FindPayload<StoredValue>): Promise<FindPayload<StoredValue>> {
    if (isFindByHookPayload(payload)) {
      const { hook } = payload;

      for (const value of this.cache.values()) {
        const foundValue = await hook(value);

        if (!foundValue) continue;

        payload.data = value;

        break;
      }
    }

    if (isFindByValuePayload(payload)) {
      const { path, value } = payload;

      if (!isPrimitive(value)) {
        payload.error = new MapProviderError({
          identifier: JoshProvider.CommonIdentifiers.FindInvalidValue,
          message: 'The "value" must be of type primitive.',
          method: Method.Find
        });

        return payload;
      }

      for (const storedValue of this.cache.values()) {
        if (payload.data !== undefined) break;
        if (value === (path.length === 0 ? storedValue : getFromObject(storedValue, path))) payload.data = storedValue;
      }
    }

    return payload;
  }

  public [Method.Get]<Value = StoredValue>(payload: GetPayload<Value>): GetPayload<Value> {
    const { key, path } = payload;

    Reflect.set(payload, 'data', path.length === 0 ? this.cache.get(key) : getFromObject(this.cache.get(key), path));

    return payload;
  }

  public [Method.GetAll](payload: GetAllPayload<StoredValue>): GetAllPayload<StoredValue> {
    for (const [key, value] of this.cache.entries()) payload.data[key] = value;

    return payload;
  }

  public [Method.GetMany](payload: GetManyPayload<StoredValue>): GetManyPayload<StoredValue> {
    const { keys } = payload;

    for (const key of keys) payload.data[key] = this.cache.get(key) ?? null;

    return payload;
  }

  public [Method.Has](payload: HasPayload): HasPayload {
    const { key, path } = payload;

    if (this.cache.has(key)) {
      payload.data = true;

      if (path.length !== 0) payload.data = hasFromObject(this.cache.get(key), path);
    }

    return payload;
  }

  public [Method.Inc](payload: IncPayload): IncPayload {
    const { key, path } = payload;
    const { data } = this.get({ method: Method.Get, key, path });

    if (data === undefined) {
      payload.error = new MapProviderError({
        identifier: JoshProvider.CommonIdentifiers.IncMissingData,
        message: path.length === 0 ? `The data at "${key}" does not exist.` : `The data at "${key}.${path.join('.')}" does not exist.`,
        method: Method.Inc
      });

      return payload;
    }

    if (typeof data !== 'number') {
      payload.error = new MapProviderError({
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

  public [Method.Keys](payload: KeysPayload): KeysPayload {
    payload.data = Array.from(this.cache.keys());

    return payload;
  }

  public async [Method.Map]<DataValue = StoredValue, HookValue = DataValue>(
    payload: MapByHookPayload<DataValue, HookValue>
  ): Promise<MapByHookPayload<DataValue, HookValue>>;

  public async [Method.Map]<DataValue = StoredValue>(payload: MapByPathPayload<DataValue>): Promise<MapByPathPayload<DataValue>>;
  public async [Method.Map]<DataValue = StoredValue, HookValue = DataValue>(
    payload: MapPayload<DataValue, HookValue>
  ): Promise<MapPayload<DataValue, HookValue>> {
    if (isMapByHookPayload(payload)) {
      const { hook } = payload;

      // @ts-expect-error 2345
      for (const value of this.cache.values()) payload.data.push(await hook(value));
    }

    if (isMapByPathPayload(payload)) {
      const { path } = payload;

      // @ts-expect-error 2345
      for (const value of this.cache.values()) payload.data.push(path.length === 0 ? value : getFromObject(value, path));
    }

    return payload;
  }

  public [Method.Math](payload: MathPayload): MathPayload {
    const { key, path, operator, operand } = payload;
    let { data } = this.get<number>({ method: Method.Get, key, path });

    if (data === undefined) {
      payload.error = new MapProviderError({
        identifier: JoshProvider.CommonIdentifiers.MathMissingData,
        message: path.length === 0 ? `The data at "${key}" does not exist.` : `The data at "${key}.${path.join('.')}" does not exist.`,
        method: Method.Math
      });

      return payload;
    }

    if (!isNumber(data)) {
      payload.error = new MapProviderError({
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

  public async [Method.Partition](payload: PartitionByHookPayload<StoredValue>): Promise<PartitionByHookPayload<StoredValue>>;
  public async [Method.Partition](payload: PartitionByValuePayload<StoredValue>): Promise<PartitionByValuePayload<StoredValue>>;
  public async [Method.Partition](payload: PartitionPayload<StoredValue>): Promise<PartitionPayload<StoredValue>> {
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
        payload.error = new MapProviderError({
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

  public [Method.Push]<Value = StoredValue>(payload: PushPayload<Value>): PushPayload<Value> {
    const { key, path, value } = payload;
    const { data } = this.get({ method: Method.Get, key, path });

    if (data === undefined) {
      payload.error = new MapProviderError({
        identifier: JoshProvider.CommonIdentifiers.PushMissingData,
        message: path.length === 0 ? `The data at "${key}" does not exist.` : `The data at "${key}.${path.join('.')}" does not exist.`,
        method: Method.Push
      });

      return payload;
    }

    if (!Array.isArray(data)) {
      payload.error = new MapProviderError({
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

  public [Method.Random](payload: RandomPayload<StoredValue>): RandomPayload<StoredValue> {
    const values = Array.from(this.cache.values());

    Reflect.set(payload, 'data', values[Math.floor(Math.random() * values.length)]);

    return payload;
  }

  public [Method.RandomKey](payload: RandomKeyPayload): RandomKeyPayload {
    const keys = Array.from(this.cache.keys());

    payload.data = keys[Math.floor(Math.random() * keys.length)];

    return payload;
  }

  public async [Method.Remove]<HookValue = StoredValue>(payload: RemoveByHookPayload<HookValue>): Promise<RemoveByHookPayload<HookValue>>;
  public async [Method.Remove](payload: RemoveByValuePayload): Promise<RemoveByValuePayload>;
  public async [Method.Remove]<HookValue = StoredValue>(payload: RemovePayload<HookValue>): Promise<RemovePayload<HookValue>> {
    if (isRemoveByHookPayload(payload)) {
      const { key, path, hook } = payload;
      const { data } = this.get<unknown[]>({ method: Method.Get, key, path });

      if (data === undefined) {
        payload.error = new MapProviderError({
          identifier: JoshProvider.CommonIdentifiers.RemoveMissingData,
          message: path.length === 0 ? `The data at "${key}" does not exist.` : `The data at "${key}.${path.join('.')}" does not exist.`,
          method: Method.Remove
        });

        return payload;
      }

      if (!Array.isArray(data)) {
        payload.error = new MapProviderError({
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
        payload.error = new MapProviderError({
          identifier: JoshProvider.CommonIdentifiers.RemoveMissingData,
          message: path.length === 0 ? `The data at "${key}" does not exist.` : `The data at "${key}.${path.join('.')}" does not exist.`,
          method: Method.Remove
        });

        return payload;
      }

      if (!Array.isArray(data)) {
        payload.error = new MapProviderError({
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

  public [Method.Set]<Value = StoredValue>(payload: SetPayload<Value>): SetPayload<Value> {
    const { key, path, value } = payload;

    // @ts-expect-error 2345
    if (path.length === 0) this.cache.set(key, value);
    else {
      const storedValue = this.cache.get(key);

      this.cache.set(key, setToObject(storedValue!, path, value));
    }

    return payload;
  }

  public [Method.SetMany]<Value = StoredValue>(payload: SetManyPayload<Value>): SetManyPayload<Value> {
    const { data } = payload;

    for (const [{ key, path }, value] of data) this.set({ method: Method.Set, key, path, value });

    return payload;
  }

  public [Method.Size](payload: SizePayload): SizePayload {
    payload.data = this.cache.size;

    return payload;
  }

  public async [Method.Some](payload: SomeByHookPayload<StoredValue>): Promise<SomeByHookPayload<StoredValue>>;
  public async [Method.Some](payload: SomeByValuePayload): Promise<SomeByValuePayload>;
  public async [Method.Some](payload: SomePayload<StoredValue>): Promise<SomePayload<StoredValue>> {
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

  public async [Method.Update]<HookValue = StoredValue, Value = HookValue>(
    payload: UpdatePayload<StoredValue, HookValue, Value>
  ): Promise<UpdatePayload<StoredValue, HookValue, Value>> {
    const { key, path, hook } = payload;
    const { data } = this.get<HookValue>({ method: Method.Get, key, path });

    if (data === undefined) return payload;

    Reflect.set(payload, 'data', await hook(data));
    this.set({ method: Method.Set, key, path, value: payload.data });

    return payload;
  }

  public [Method.Values](payload: ValuesPayload<StoredValue>): ValuesPayload<StoredValue> {
    Reflect.set(payload, 'data', Array.from(this.cache.values()));

    return payload;
  }
}
