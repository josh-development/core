import { deleteFromObject, getFromObject, setFromObject } from '@realware/utilities';
import { Stopwatch } from '@sapphire/stopwatch';
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

export class MapProvider<Value = unknown> extends JoshProvider<Value> {
	private cache = new Map<string, Value>();

	private autoKeyCount = 0;

	public autoKey(payload: AutoKeyPayload): AutoKeyPayload {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		this.autoKeyCount++;

		payload.data = this.autoKeyCount.toString();
		payload.stopwatch.stop();

		return payload;
	}

	public dec(payload: DecPayload): DecPayload {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

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

		if (number === undefined) return payload;
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
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

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

		payload.stopwatch.stop();

		return payload;
	}

	public ensure<CustomValue = Value>(payload: EnsurePayload<CustomValue>): EnsurePayload<CustomValue> {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		const { key } = payload;

		// @ts-expect-error 2345
		if (!this.cache.has(key)) this.cache.set(key, payload.defaultValue);

		Reflect.set(payload, 'data', this.cache.get(key));
		payload.stopwatch.stop();

		return payload;
	}

	public filterByData<CustomValue = Value>(payload: FilterByDataPayload<CustomValue>): FilterByDataPayload<CustomValue> {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		const { path, inputData } = payload;

		for (const key of this.keys({ method: Method.Keys, data: [] }).data) {
			const { data } = this.get<CustomValue>({ method: Method.Get, key, path });

			if (data === undefined) continue;
			if (inputData !== data) continue;

			payload.data[key] = data;
		}

		payload.stopwatch.stop();

		return payload;
	}

	public async filterByHook<CustomValue = Value>(payload: FilterByHookPayload<CustomValue>): Promise<FilterByHookPayload<CustomValue>> {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		const { path, inputHook } = payload;

		for (const key of this.keys({ method: Method.Keys, data: [] }).data) {
			const { data } = this.get<CustomValue>({ method: Method.Get, key, path });

			if (data === undefined) continue;
			if (!(await inputHook(data))) continue;

			payload.data[key] = data;
		}

		payload.stopwatch.stop();

		return payload;
	}

	public findByData<CustomValue = Value>(payload: FindByDataPayload<CustomValue>): FindByDataPayload<CustomValue> {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		const { path, inputData } = payload;

		for (const key of this.keys({ method: Method.Keys, data: [] }).data) {
			const { data } = this.get<CustomValue>({ method: Method.Get, key, path });

			if (data === undefined) continue;
			if (inputData !== data) continue;

			payload.data = data;
			break;
		}

		payload.stopwatch.stop();

		return payload;
	}

	public async findByHook<CustomValue = Value>(payload: FindByHookPayload<CustomValue>): Promise<FindByHookPayload<CustomValue>> {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		const { path, inputHook } = payload;

		for (const key of this.keys({ method: Method.Keys, data: [] }).data) {
			const { data } = this.get<CustomValue>({ method: Method.Get, key, path });

			if (data === undefined) continue;
			if (!(await inputHook(data))) continue;

			payload.data = data;
			break;
		}

		payload.stopwatch.stop();

		return payload;
	}

	public get<CustomValue = Value>(payload: GetPayload<CustomValue>): GetPayload<CustomValue> {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		const { key, path } = payload;

		Reflect.set(payload, 'data', path ? getFromObject(this.cache.get(key), path) : this.cache.get(key));
		payload.stopwatch.stop();

		return payload;
	}

	public getAll<CustomValue = Value>(payload: GetAllPayload<CustomValue>): GetAllPayload<CustomValue> {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		for (const [key, value] of this.cache.entries()) Reflect.set(payload.data, key, value);

		payload.stopwatch.stop();

		return payload;
	}

	public getMany<CustomValue = Value>(payload: GetManyPayload<CustomValue>): GetManyPayload<CustomValue> {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		for (const [key, path] of payload.keyPaths) {
			const { data } = this.get({ method: Method.Get, key, path, data: null });

			Reflect.set(payload.data, key, data);
		}

		payload.stopwatch.stop();

		return payload;
	}

	public has(payload: HasPayload): HasPayload {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		const { key, path } = payload;

		if (this.cache.has(key)) {
			payload.data = true;

			if (path) payload.data = Boolean(getFromObject(this.cache.get(key), path));
		}

		payload.stopwatch.stop();

		return payload;
	}

	public inc(payload: IncPayload): IncPayload {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

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

		if (number === undefined) return payload;
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
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		payload.data = Array.from(this.cache.keys());
		payload.stopwatch.stop();

		return payload;
	}

	public push<CustomValue = Value>(payload: PushPayload, value: CustomValue): PushPayload {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

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
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		const values = Array.from(this.cache.values());

		Reflect.set(payload, 'data', values.length ? values[Math.floor(Math.random() * values.length)] : null);
		payload.stopwatch.stop();

		return payload;
	}

	public randomKey(payload: RandomKeyPayload): RandomKeyPayload {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		const keys = Array.from(this.cache.keys());

		payload.data = keys[Math.floor(Math.random() * keys.length)];
		payload.stopwatch.stop();

		return payload;
	}

	public set<CustomValue = Value>(payload: SetPayload, value: CustomValue): SetPayload {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		const { key, path } = payload;

		if (path) {
			const { data } = this.get({ method: Method.Get, stopwatch: new Stopwatch(), key });

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

		payload.stopwatch.stop();

		return payload;
	}

	public setMany<CustomValue = Value>(payload: SetManyPayload, value: CustomValue): SetManyPayload {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		for (const [key, path] of payload.keyPaths) this.set({ method: Method.Set, key, path }, value);

		payload.stopwatch.stop();

		return payload;
	}

	public size(payload: SizePayload): SizePayload {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		payload.data = this.cache.size;
		payload.stopwatch.stop();

		return payload;
	}

	public someByData<CustomValue = Value>(payload: SomeByDataPayload<CustomValue>): SomeByDataPayload<CustomValue> {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		const { path, inputData } = payload;

		for (const key of this.keys({ method: Method.Keys, data: [] }).data) {
			const { data } = this.get<CustomValue>({ method: Method.Get, key, path });

			if (data === undefined) continue;
			if (inputData !== data) continue;

			payload.data = true;
			break;
		}

		payload.stopwatch.stop();

		return payload;
	}

	public async someByHook<CustomValue = Value>(payload: SomeByHookPayload<CustomValue>): Promise<SomeByHookPayload<CustomValue>> {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		const { path, inputHook } = payload;

		for (const key of this.keys({ method: Method.Keys, data: [] }).data) {
			const { data } = this.get<CustomValue>({ method: Method.Get, key, path });

			if (data === undefined) continue;
			if (!(await inputHook(data))) continue;

			payload.data = true;
			break;
		}

		payload.stopwatch.stop();

		return payload;
	}

	public updateByData<CustomValue = Value>(payload: UpdateByDataPayload<CustomValue>): UpdateByDataPayload<CustomValue> {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		const { key, path } = payload;
		const { data } = this.get({ method: Method.Get, key, path, data: payload.inputData! });

		if (data === undefined) return payload;

		Reflect.set(payload, 'data', isObject(payload.inputData) ? mergeDefault(data ?? {}, payload.inputData) : payload.inputData);
		this.set({ method: Method.Set, key, path }, payload.data);
		payload.stopwatch.stop();

		return payload;
	}

	public async updateByHook<CustomValue = Value>(payload: UpdateByHookPayload<CustomValue>): Promise<UpdateByHookPayload<CustomValue>> {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		const { key, path, inputHook } = payload;
		const { data } = this.get<CustomValue>({ method: Method.Get, key, path });

		if (data === undefined) return payload;

		payload.data = await inputHook!(data);
		this.set({ method: Method.Set, key, path }, payload.data);
		payload.stopwatch.stop();

		return payload;
	}

	public values<CustomValue = Value>(payload: ValuesPayload<CustomValue>): ValuesPayload<CustomValue> {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		Reflect.set(payload, 'data', Array.from(this.cache.values()));
		payload.stopwatch.stop();

		return payload;
	}
}

export namespace MapProvider {
	export enum Identifiers {
		DecInvalidType = 'decInvalidType',

		DeleteMissingData = 'deleteMissingData',

		IncInvalidType = 'incInvalidType',

		PushInvalidType = 'pushInvalidType',

		PushMissingData = 'pushMissingData',

		SetMissingData = 'setMissingData'
	}
}
