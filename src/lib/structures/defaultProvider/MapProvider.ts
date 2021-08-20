import { deleteFromObject, getFromObject, setFromObject } from '@realware/utilities';
import { isObject, mergeDefault } from '@sapphire/utilities';
import type {
	AutoKeyPayload,
	DecPayload,
	DeletePayload,
	EnsurePayload,
	FilterByDataPayload,
	FilterByHookPayload,
	FindByDataPayload,
	FindByHookPayload,
	GetAllPayload,
	GetManyPayload,
	GetPayload,
	HasPayload,
	IncPayload,
	KeysPayload,
	MapByHookPayload,
	MapByPathPayload,
	PushPayload,
	RandomKeyPayload,
	RandomPayload,
	SetManyPayload,
	SetPayload,
	SizePayload,
	SomeByDataPayload,
	SomeByHookPayload,
	UpdateByDataPayload,
	UpdateByHookPayload,
	ValuesPayload
} from '../../payloads';
import { Method } from '../../types';
import { JoshProvider } from '../JoshProvider';
import { MapProviderError } from './MapProviderError';

/**
 * A provider that uses the Node.js native [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) class.
 * @since 2.0.0
 */
export class MapProvider<Value = unknown> extends JoshProvider<Value> {
	/**
	 * The [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) cache to store data.
	 * @since 2.0.0
	 * @private
	 */
	private cache = new Map<string, Value>();

	/**
	 * A simple cache for the {@link MapProvider.autoKey} method.
	 * @since 2.0.0
	 */
	private autoKeyCount = 0;

	public autoKey(payload: AutoKeyPayload): AutoKeyPayload {
		this.autoKeyCount++;

		payload.data = this.autoKeyCount.toString();

		return payload;
	}

	public dec(payload: DecPayload): DecPayload {
		const { key, path } = payload;
		const { data } = this.get({ method: Method.Get, key });

		if (!path) {
			if (typeof data !== 'number') {
				payload.error = new MapProviderError({
					identifier: MapProvider.Identifiers.DecInvalidType,
					message: `The data at "${key}" must be of type "number".`,
					method: Method.Dec
				});

				return payload;
			}

			payload.data = data - 1;

			this.set({ method: Method.Set, key }, payload.data);

			return payload;
		}

		const number = getFromObject(data, path);

		if (number === undefined) {
			payload.error = new MapProviderError({
				identifier: MapProvider.Identifiers.DecMissingData,
				message: `The data at "${key}.${path.join('.')}" does not exist.`,
				method: Method.Dec
			});

			return payload;
		}

		if (typeof number !== 'number') {
			payload.error = new MapProviderError({
				identifier: MapProvider.Identifiers.DecInvalidType,
				message: `The data at "${key}.${path.join('.')}" must be of type "number".`,
				method: Method.Dec
			});

			return payload;
		}

		payload.data = number - 1;

		this.set({ method: Method.Set, key, path }, payload.data);

		return payload;
	}

	public delete(payload: DeletePayload): DeletePayload {
		const { key, path } = payload;

		if (!path) {
			this.cache.delete(key);

			return payload;
		}

		if (this.has({ method: Method.Has, key, path, data: false }).data) {
			const { data } = this.get({ method: Method.Get, key });

			if (data === undefined) {
				payload.error = new MapProviderError({
					identifier: MapProvider.Identifiers.DeleteMissingData,
					message: `The data at "${key}.${path.join('.')}" does not exist.`,
					method: Method.Delete
				});

				return payload;
			}

			this.set({ method: Method.Set, key, path }, deleteFromObject(data, path));
		}

		return payload;
	}

	public ensure<CustomValue = Value>(payload: EnsurePayload<CustomValue>): EnsurePayload<CustomValue> {
		const { key } = payload;

		// @ts-expect-error 2345
		if (!this.cache.has(key)) this.cache.set(key, payload.defaultValue);

		Reflect.set(payload, 'data', this.cache.get(key));

		return payload;
	}

	public filterByData<CustomValue = Value>(payload: FilterByDataPayload<CustomValue>): FilterByDataPayload<CustomValue> {
		const { path, inputData } = payload;

		for (const key of this.keys({ method: Method.Keys, data: [] }).data) {
			const { data } = this.get<CustomValue>({ method: Method.Get, key, path });

			if (data === undefined) continue;
			if (inputData !== data) continue;

			payload.data[key] = data;
		}

		return payload;
	}

	public async filterByHook<CustomValue = Value>(payload: FilterByHookPayload<CustomValue>): Promise<FilterByHookPayload<CustomValue>> {
		const { path, inputHook } = payload;

		for (const key of this.keys({ method: Method.Keys, data: [] }).data) {
			const { data } = this.get<CustomValue>({ method: Method.Get, key, path });

			if (data === undefined) continue;
			if (!(await inputHook(data))) continue;

			payload.data[key] = data;
		}

		return payload;
	}

	public findByData<CustomValue = Value>(payload: FindByDataPayload<CustomValue>): FindByDataPayload<CustomValue> {
		const { path, inputData } = payload;

		for (const key of this.keys({ method: Method.Keys, data: [] }).data) {
			const { data } = this.get<CustomValue>({ method: Method.Get, key, path });

			if (data === undefined) continue;
			if (inputData !== data) continue;

			payload.data = data;
			break;
		}

		return payload;
	}

	public async findByHook<CustomValue = Value>(payload: FindByHookPayload<CustomValue>): Promise<FindByHookPayload<CustomValue>> {
		const { path, inputHook } = payload;

		for (const key of this.keys({ method: Method.Keys, data: [] }).data) {
			const { data } = this.get<CustomValue>({ method: Method.Get, key, path });

			if (data === undefined) continue;
			if (!(await inputHook(data))) continue;

			payload.data = data;
			break;
		}

		return payload;
	}

	public get<CustomValue = Value>(payload: GetPayload<CustomValue>): GetPayload<CustomValue> {
		const { key, path } = payload;

		Reflect.set(payload, 'data', path ? getFromObject(this.cache.get(key), path) : this.cache.get(key));

		return payload;
	}

	public getAll<CustomValue = Value>(payload: GetAllPayload<CustomValue>): GetAllPayload<CustomValue> {
		for (const [key, value] of this.cache.entries()) Reflect.set(payload.data, key, value);

		return payload;
	}

	public getMany<CustomValue = Value>(payload: GetManyPayload<CustomValue>): GetManyPayload<CustomValue> {
		for (const [key, path] of payload.keyPaths) {
			const { data } = this.get({ method: Method.Get, key, path, data: null });

			Reflect.set(payload.data, key, data);
		}

		return payload;
	}

	public has(payload: HasPayload): HasPayload {
		const { key, path } = payload;

		if (this.cache.has(key)) {
			payload.data = true;

			if (path) payload.data = Boolean(getFromObject(this.cache.get(key), path));
		}

		return payload;
	}

	public inc(payload: IncPayload): IncPayload {
		const { key, path } = payload;
		const { data } = this.get({ method: Method.Get, key });

		if (!path) {
			if (typeof data !== 'number') {
				payload.error = new MapProviderError({
					identifier: MapProvider.Identifiers.IncInvalidType,
					message: `The data at "${key}" must be of type "number".`,
					method: Method.Dec
				});

				return payload;
			}

			payload.data = data + 1;

			this.set({ method: Method.Set, key }, payload.data);

			return payload;
		}

		const number = getFromObject(data, path);

		if (number === undefined) {
			payload.error = new MapProviderError({
				identifier: MapProvider.Identifiers.IncMissingData,
				message: `The data at "${key}.${path.join('.')}" does not exist.`,
				method: Method.Inc
			});

			return payload;
		}

		if (typeof number !== 'number') {
			payload.error = new MapProviderError({
				identifier: MapProvider.Identifiers.IncInvalidType,
				message: `The data at "${key}.${path.join('.')}" must be of type "number".`,
				method: Method.Dec
			});

			return payload;
		}

		payload.data = number + 1;

		this.set({ method: Method.Set, key, path }, payload.data);

		return payload;
	}

	public keys(payload: KeysPayload): KeysPayload {
		payload.data = Array.from(this.cache.keys());

		return payload;
	}

	public mapByPath<CustomValue = Value>(payload: MapByPathPayload<CustomValue>): MapByPathPayload<CustomValue> {
		const { path } = payload;

		for (const key of this.keys({ method: Method.Keys, data: [] }).data)
			payload.data.push(this.get<CustomValue>({ method: Method.Get, key, path }).data!);

		return payload;
	}

	public async mapByHook<CustomValue = Value>(payload: MapByHookPayload<CustomValue>): Promise<MapByHookPayload<CustomValue>> {
		const { hook } = payload;

		for (const value of this.values({ method: Method.Values, data: [] }).data) payload.data.push(await hook(value));

		return payload;
	}

	public push<CustomValue = Value>(payload: PushPayload, value: CustomValue): PushPayload {
		const { key, path } = payload;
		const { data } = this.get({ method: Method.Get, key });

		if (!path) {
			if (!Array.isArray(data)) {
				payload.error = new MapProviderError({
					identifier: MapProvider.Identifiers.PushInvalidType,
					message: `The data at "${key}" must be an array.`,
					method: Method.Push
				});

				return payload;
			}

			data.push(value);

			this.set({ method: Method.Set, key }, data);

			return payload;
		}

		const array = getFromObject(data, path);

		if (array === undefined) {
			payload.error = new MapProviderError({
				identifier: MapProvider.Identifiers.PushMissingData,
				message: `The data at "${key}.${path.join('.')}" does not exist.`,
				method: Method.Push
			});

			return payload;
		}

		if (!Array.isArray(array)) {
			payload.error = new MapProviderError({
				identifier: MapProvider.Identifiers.PushInvalidType,
				message: `The data at "${key}.${path.join('.')} must be an array.`,
				method: Method.Push
			});

			return payload;
		}

		array.push(value);

		this.set({ method: Method.Set, key, path }, array);

		return payload;
	}

	public random<CustomValue = Value>(payload: RandomPayload<CustomValue>): RandomPayload<CustomValue> {
		const values = Array.from(this.cache.values());

		Reflect.set(payload, 'data', values.length ? values[Math.floor(Math.random() * values.length)] : null);

		return payload;
	}

	public randomKey(payload: RandomKeyPayload): RandomKeyPayload {
		const keys = Array.from(this.cache.keys());

		payload.data = keys[Math.floor(Math.random() * keys.length)];

		return payload;
	}

	public set<CustomValue = Value>(payload: SetPayload, value: CustomValue): SetPayload {
		const { key, path } = payload;

		if (path) {
			const { data } = this.get({ method: Method.Get, key });

			if (data === undefined) {
				payload.error = new MapProviderError({
					identifier: MapProvider.Identifiers.SetMissingData,
					message: `The data at "${key}" does not exist and cannot be set.`,
					method: Method.Set
				});

				return payload;
			}

			this.cache.set(key, setFromObject(data, path, value));

			// @ts-expect-error 2345
		} else this.cache.set(key, value);

		return payload;
	}

	public setMany<CustomValue = Value>(payload: SetManyPayload, value: CustomValue): SetManyPayload {
		for (const [key, path] of payload.keyPaths) this.set({ method: Method.Set, key, path }, value);

		return payload;
	}

	public size(payload: SizePayload): SizePayload {
		payload.data = this.cache.size;

		return payload;
	}

	public someByData<CustomValue = Value>(payload: SomeByDataPayload<CustomValue>): SomeByDataPayload<CustomValue> {
		const { path, inputData } = payload;

		for (const key of this.keys({ method: Method.Keys, data: [] }).data) {
			const { data } = this.get<CustomValue>({ method: Method.Get, key, path });

			if (data === undefined) continue;
			if (inputData !== data) continue;

			payload.data = true;
			break;
		}

		return payload;
	}

	public async someByHook<CustomValue = Value>(payload: SomeByHookPayload<CustomValue>): Promise<SomeByHookPayload<CustomValue>> {
		const { path, inputHook } = payload;

		for (const key of this.keys({ method: Method.Keys, data: [] }).data) {
			const { data } = this.get<CustomValue>({ method: Method.Get, key, path });

			if (data === undefined) continue;
			if (!(await inputHook(data))) continue;

			payload.data = true;
			break;
		}

		return payload;
	}

	public updateByData<CustomValue = Value>(payload: UpdateByDataPayload<CustomValue>): UpdateByDataPayload<CustomValue> {
		const { key, path } = payload;
		const { data } = this.get({ method: Method.Get, key, path, data: payload.inputData! });

		if (data === undefined) return payload;

		Reflect.set(payload, 'data', isObject(payload.inputData) ? mergeDefault(data ?? {}, payload.inputData) : payload.inputData);
		this.set({ method: Method.Set, key, path }, payload.data);

		return payload;
	}

	public async updateByHook<CustomValue = Value>(payload: UpdateByHookPayload<CustomValue>): Promise<UpdateByHookPayload<CustomValue>> {
		const { key, path, inputHook } = payload;
		const { data } = this.get<CustomValue>({ method: Method.Get, key, path });

		if (data === undefined) return payload;

		payload.data = await inputHook!(data);
		this.set({ method: Method.Set, key, path }, payload.data);

		return payload;
	}

	public values<CustomValue = Value>(payload: ValuesPayload<CustomValue>): ValuesPayload<CustomValue> {
		Reflect.set(payload, 'data', Array.from(this.cache.values()));

		return payload;
	}
}

export namespace MapProvider {
	export enum Identifiers {
		DecInvalidType = 'decInvalidType',

		DecMissingData = 'decMissingData',

		DeleteMissingData = 'deleteMissingData',

		IncInvalidType = 'incInvalidType',

		IncMissingData = 'incMissingData',

		PushInvalidType = 'pushInvalidType',

		PushMissingData = 'pushMissingData',

		SetMissingData = 'setMissingData'
	}
}
