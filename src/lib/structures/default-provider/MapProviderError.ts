import { JoshProviderError } from '../../errors';

/**
 * The error class for the MapProvider.
 * @since 2.0.0
 */
export class MapProviderError extends JoshProviderError {
  /**
   * The name for this error.
   */
  public get name() {
    return 'MapProviderError';
  }
}
