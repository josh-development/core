import { resolve } from 'path';
import { defineConfig } from 'rollup';
import cleaner from 'rollup-plugin-cleaner';
import typescript from 'rollup-plugin-typescript2';

export default defineConfig({
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
    }
  ],
  external: ['@joshdb/auto-ensure', '@joshdb/map', '@joshdb/provider', '@sapphire/utilities', 'process'],
  plugins: [cleaner({ targets: ['./dist'] }), typescript({ tsconfig: resolve(process.cwd(), 'src', 'tsconfig.json') })]
});
