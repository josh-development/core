import { get, set } from 'lodash';
import { Methods } from '../types/Methods';
import { JoshProvider } from './JoshProvider';
import type { GetPayload } from './payloads/Get';
import type { Payload } from './payloads/Payload';

export class MapProvider<T = unknown> extends JoshProvider<T> {
	private cache = new Map<string, T>();

	public get<V = T>(key: string, path: string): GetPayload<V> {
		const startTimestamp = Date.now();

		const data = (path.length ? get(this.cache.get(key), path) : this.cache.get(key)) ?? null;

		const endTimestamp = Date.now();

		return {
			method: Methods.Get,
			startTimestamp,
			endTimestamp,
			data
		};
	}

	public set<V = T>(key: string, path: string, value: V): Payload<Methods.Set> {
		const startTimestamp = Date.now();

		if (path.length) {
			const { data } = this.get(key, '');

			this.cache.set(key, set(data as unknown as Record<any, any>, path, value));
		} else this.cache.set(key, value as unknown as T);

		const endTimestamp = Date.now();

		return {
			method: Methods.Set,
			startTimestamp,
			endTimestamp
		};
	}
}
