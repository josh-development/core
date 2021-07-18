import type { Awaited } from '@sapphire/utilities';
import type { Josh } from './Josh';
import type { GetPayload } from './payloads/Get';
import type { GetAllPayload } from './payloads/GetAllPayload';
import type { SetPayload } from './payloads/Set';

export abstract class JoshProvider<T = unknown> {
	public name: string;

	public instance?: Josh<T>;

	public options: JoshProviderOptions;

	public constructor(context: JoshProviderContext<T>) {
		const { name, options, instance } = context;

		this.name = name ?? 'unknown';
		this.options = options ?? {};
		this.instance = instance;
	}

	public async init() {
		return Promise.resolve(true);
	}

	public abstract get<V = T>(key: string, path: string): Awaited<GetPayload<V>>;

	public abstract getAll<V = T>(): Awaited<GetAllPayload<V>>;

	public abstract set<V = T>(key: string, path: string, value: V): Awaited<SetPayload>;

	protected getKeyAndPath(keyOrPath: string): [string, string] {
		const [key, ...path] = keyOrPath.split('.');
		return [key, path.join('.')];
	}
}

export interface JoshProviderOptions {}

export interface JoshProviderContext<T = unknown> {
	name?: string;

	instance?: Josh<T>;

	options?: JoshProviderOptions;
}
