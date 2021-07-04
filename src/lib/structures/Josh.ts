import { get } from 'lodash';
import { join } from 'path';
import { JoshError } from './JoshError';
import { JoshProvider, JoshProviderOptions } from './JoshProvider';
import { MapProvider } from './MapProvider';
import { MiddlewareStore } from './MiddlewareStore';

export interface JoshOptions {
	provider?: typeof JoshProvider;
	providerOptions?: JoshProviderOptions;
	name?: string;
	middlewareDirectory?: string;
}

export class Josh<T = unknown> {
	public name: string;

	private middleware: MiddlewareStore;
	private provider: JoshProvider<T>;

	public constructor(options: JoshOptions) {
		const { name, provider, middlewareDirectory } = options;

		if (!name) throw new JoshError('Name option not found.', 'JoshOptionsError');

		const Provider = provider ?? Josh.defaultProvider;

		if (!JoshProvider.isPrototypeOf(Provider)) throw new JoshError('Provider class must extend JoshProvider.');

		// @ts-expect-error 2511
		const initializedProvider = new Provider({ name, instance: this, options: options.providerOptions });

		this.provider = initializedProvider;
		this.name = name;
		this.middleware = new MiddlewareStore().registerPath(middlewareDirectory ?? join(__dirname, '..', 'middleware', this.name));
	}

	public async get<V = T>(keyOrPath: string): Promise<V | null> {
		const [key, path] = this.getKeyAndPath(keyOrPath);
		const { data } = await this.provider.get<T>(key, path);

		return (path.length ? get(data, path) : data) ?? null;
	}

	public async set<V = T>(keyOrPath: string, value: V): Promise<this> {
		const [key, path] = this.getKeyAndPath(keyOrPath);

		await this.provider.set<V>(key, path, value);

		return this;
	}

	public async init(): Promise<this> {
		await this.middleware.loadAll();

		const success = await this.provider.init();

		if (!success) throw new JoshError('Initiating provider was unsuccessful.');

		return this;
	}

	private getKeyAndPath(keyOrPath: string): [string, string] {
		const [key, ...path] = keyOrPath.split('.');
		return [key, path.join('.')];
	}

	public static defaultProvider: typeof JoshProvider = MapProvider;
}
