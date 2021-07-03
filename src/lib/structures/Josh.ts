import { get } from 'lodash';
import { JoshError } from './JoshError';
import { JoshProvider, JoshProviderOptions } from './JoshProvider';
import { MapProvider } from './MapProvider';

export interface JoshOptions {
	provider?: typeof JoshProvider;
	providerOptions?: JoshProviderOptions;
	name?: string;
}

export class Josh<T = unknown> {
	public name: string;

	public all = Symbol('all');
	public off = Symbol('off');

	private provider: JoshProvider<T>;

	private isDestroyed = false;

	private ready!: (value?: unknown) => void;
	private defer = new Promise((resolve) => (this.ready = resolve));

	public constructor(options: JoshOptions) {
		const { name, provider } = options;

		if (!name) throw new JoshError('Name option not found.', 'JoshOptionsError');

		const Provider = provider ?? Josh.defaultProvider;

		if (!JoshProvider.isPrototypeOf(Provider)) throw new JoshError('Provider class must extend JoshProvider.');

		// @ts-expect-error 2511
		const initializedProvider = new Provider({ name, instance: this, options: options.providerOptions });

		this.provider = initializedProvider;
		this.name = name;

		void this.provider.init().then(() => this.ready());
	}

	public async readyHook() {
		await this.defer;
		if (this.isDestroyed) throw new JoshError('This Josh instance has been destroyed.');
	}

	public async get<V = T>(keyOrPath: string): Promise<V | null> {
		await this.readyHook();

		const [key, path] = this.getKeyAndPath(keyOrPath);
		const { data } = await this.provider.get<T>(key, path);

		return (path.length ? get(data, path) : data) ?? null;
	}

	public async set<V = T>(keyOrPath: string, value: V): Promise<this> {
		await this.readyHook();

		const [key, path] = this.getKeyAndPath(keyOrPath);

		await this.provider.set<V>(key, path, value);

		return this;
	}

	private getKeyAndPath(keyOrPath: string): [string, string] {
		const [key, ...path] = keyOrPath.split('.');
		return [key, path.join('.')];
	}

	public static defaultProvider: typeof JoshProvider = MapProvider;
}
