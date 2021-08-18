import type { Method } from '../types';
import { JoshError } from './JoshError';

/**
 * The base class for {@link JoshProvider}.
 * @since 2.0.0
 */
export class JoshProviderError extends JoshError {
	/**
	 * The method this error applies to.
	 * @since 2.0.0
	 */
	public method: Method;

	public constructor(options: JoshProviderError.Options) {
		super(options);

		this.method = options.method;
	}

	/**
	 * The name for this error.
	 * @since 2.0.0
	 */
	public get name() {
		return 'JoshProviderError';
	}
}

export namespace JoshProviderError {
	/**
	 * The options for {@link JoshProviderError}
	 * @since 2.0.0
	 */
	export interface Options extends JoshError.Options {
		/**
		 * The method this error applies to.
		 * @since 2.0.0
		 */
		method: Method;
	}
}
