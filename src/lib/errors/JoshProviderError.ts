import type { Method } from '../types';
import { JoshError } from './JoshError';

export class JoshProviderError extends JoshError {
	public method: Method;

	public constructor(options: JoshProviderError.Options) {
		super(options);

		this.method = options.method;
	}

	public get name() {
		return 'JoshProviderError';
	}
}

export namespace JoshProviderError {
	export interface Options extends JoshError.Options {
		method: Method;
	}
}
