import { runProviderTest } from '@joshdb/provider';
import { MapProvider } from '../../../../src';

runProviderTest<typeof MapProvider>({ providerConstructor: MapProvider });
