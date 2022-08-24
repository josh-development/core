import type { JoshProviderError } from '@joshdb/provider';

/**
 * The base class for errors in `Josh`
 * @since 2.0.0
 */
export class JoshError extends Error {
  /**
   * The identifier for this error.
   * @since 2.0.0
   */
  public identifier: string;

  /**
   * The errors for this error.
   * @since 2.0.0
   */
  public errors: JoshProviderError[];

  public constructor(options: JoshErrorOptions) {
    const { name, message, identifier, errors } = options;

    super(message);
    this.name = name ?? 'JoshError';
    this.identifier = identifier;
    this.errors = errors;
  }
}

/**
 * The options for `JoshError`
 * @since 2.0.0
 */
export interface JoshErrorOptions {
  /**
   * The name for this error.
   * @since 2.0.0
   */
  name?: string;

  /**
   * The identifier for this error.
   * @since 2.0.0
   */
  identifier: string;

  /**
   * The errors for this error.
   * @since 2.0.0
   */
  errors: JoshProviderError[];

  /**
   * The message for this error.
   * @since 2.0.0
   */
  message?: string;
}
