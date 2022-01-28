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

  public constructor(options: JoshError.Options) {
    super(options.message);

    this.identifier = options.identifier;
  }

  /**
   * The name of this error.
   */
  public get name() {
    return 'JoshError';
  }
}

export namespace JoshError {
  /**
   * The options for {@link JoshError}
   * @since 2.0.0
   */
  export interface Options {
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
}
