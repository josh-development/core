import { JoshProviderError } from '../../errors';

export class MapProviderError extends JoshProviderError {
	public get name() {
		return 'MapProviderError';
	}
}
