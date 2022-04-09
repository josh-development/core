/**
 * The base class for errors in {@link Josh}
 * @since 2.0.0
 */
export class JoshError extends Error {
  /**
   * The identifier for this error.
   * @since 2.0.0
   */
  public identifier: string;

  public constructor(options: JoshErrorOptions) {
    const { name, message, identifier } = options;

    super(message);
    this.name = name ?? 'JoshError';
    this.identifier = identifier;
  }
}

/**
 * The options for {@link JoshError}
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
   * The message for this error.
   * @since 2.0.0
   */
  message?: string;
}
