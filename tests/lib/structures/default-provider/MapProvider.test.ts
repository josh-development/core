import { runProviderTest } from '@joshdb/tests';
import { MapProvider } from '../../../../src';

// @ts-expect-error 2344
runProviderTest<typeof MapProvider>({ providerConstructor: MapProvider });
