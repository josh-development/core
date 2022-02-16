import type { Method } from '../types';
import { JoshError, JoshErrorOptions } from './JoshError';

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

  public constructor(options: JoshProviderErrorOptions) {
    const { name, method } = options;

    super({ ...options, name: name ?? 'JoshProviderError' });

    this.method = method;
  }
}

/**
 * The options for {@link JoshProviderError}
 * @since 2.0.0
 */
export interface JoshProviderErrorOptions extends JoshErrorOptions {
  /**
   * The method this error applies to.
   * @since 2.0.0
   */
  method: Method;
}
