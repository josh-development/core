import { resolve } from 'path';
import cleaner from 'rollup-plugin-cleaner';
import typescript from 'rollup-plugin-typescript2';
import versionInjector from 'rollup-plugin-version-injector';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: './dist/index.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    {
      file: './dist/index.mjs',
      format: 'es',
      exports: 'named',
      sourcemap: true
    },
    {
      file: './dist/index.umd.js',
      format: 'umd',
      name: 'JoshCore',
      sourcemap: true,
      globals: {
        '@realware/utilities': 'RealwareUtilities',
        '@sapphire/utilities': 'SapphireUtilities',
        'fs/promises': 'FSPromises',
        process: 'Process'
      }
    }
  ],
  external: ['@sapphire/utilities', '@realware/utilities', 'fs/promises', 'process'],
  plugins: [cleaner({ targets: ['./dist'] }), typescript({ tsconfig: resolve(process.cwd(), 'src', 'tsconfig.json') }), versionInjector()]
};
