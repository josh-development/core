import { get, set } from 'lodash';
import { Method } from '../types/Method';
import { JoshProvider } from './JoshProvider';
import type { GetPayload } from './payloads/Get';
import type { SetPayload } from './payloads/Set';

export class MapProvider<T = unknown> extends JoshProvider<T> {
	private cache = new Map<string, T>();

	public get<V = T>(key: string, path: string): GetPayload<V> {
		const startTimestamp = Date.now();

		const data = (path.length ? get(this.cache.get(key), path) : this.cache.get(key)) ?? null;

		const endTimestamp = Date.now();

		return {
			method: Method.Get,
			startTimestamp,
			endTimestamp,
			data
		};
	}

	public set<V = T>(key: string, path: string, value: V): SetPayload {
		const startTimestamp = Date.now();

		if (path.length) {
			const { data } = this.get(key, '');

			this.cache.set(key, set(data as unknown as Record<any, any>, path, value));
		} else this.cache.set(key, value as unknown as T);

		const endTimestamp = Date.now();

		return {
			method: Method.Set,
			startTimestamp,
			endTimestamp
		};
	}
}
