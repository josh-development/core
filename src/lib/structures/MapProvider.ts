import { get, set } from '@joshdb/utilities';
import { Stopwatch } from '@sapphire/stopwatch';
import { Method } from '../types';
import { JoshProvider } from './JoshProvider';
import type { GetAllPayload, GetPayload, SetPayload } from './payloads';
import type { EnsurePayload } from './payloads/Ensure';
import type { HasPayload } from './payloads/Has';

export class MapProvider<T = unknown> extends JoshProvider<T> {
	private cache = new Map<string, T>();

	public ensure<V = T>(payload: EnsurePayload<V>): EnsurePayload<V> {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		const { key } = payload;

		if (!this.cache.has(key)) this.cache.set(key, payload.defaultValue as unknown as T);

		payload.data = this.cache.get(key) as unknown as V;
		payload.stopwatch.stop();

		return payload;
	}

	public get<V = T>(payload: GetPayload<V>): GetPayload<V> {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		const { key, path } = payload;

		payload.data = ((path.length ? get(this.cache.get(key), path) : this.cache.get(key)) ?? null) as V | null;
		payload.stopwatch.stop();

		return payload;
	}

	public getAll<V = T>(payload: GetAllPayload<V>): GetAllPayload<V> {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		for (const [key, value] of this.cache.entries()) payload.data[key] = value as unknown as V;

		payload.stopwatch.stop();

		return payload;
	}

	public has(payload: HasPayload): HasPayload {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		const { key, path } = payload;

		if (this.cache.has(key)) {
			payload.data = true;

			if (path.length) payload.data = Boolean(get(this.cache.get(key), path));
		}

		payload.stopwatch.stop();

		return payload;
	}

	public set<V = T>(payload: SetPayload, value: V): SetPayload {
		payload.stopwatch = new Stopwatch();
		payload.stopwatch.start();

		const { key, path } = payload;

		if (path.length) {
			const { data } = this.get({ method: Method.Get, stopwatch: new Stopwatch(), key, path, data: null });

			this.cache.set(key, set(data as unknown as Record<any, any>, path, value));
		} else this.cache.set(key, value as unknown as T);

		payload.stopwatch.stop();

		return payload;
	}
}
