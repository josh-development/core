import { relative, resolve } from 'node:path';
import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: false,
  entry: ['src/index.ts'],
  format: ['esm', 'cjs', 'iife'],
  minify: false,
  skipNodeModulesBundle: true,
  sourcemap: true,
  target: 'es2021',
  tsconfig: relative(__dirname, resolve(process.cwd(), 'src', 'tsconfig.json')),
  keepNames: true,
  globalName: 'PropertyHelpers',
  esbuildOptions(options, context) {
    if (context.format === 'cjs') {
      options.banner = {
        js: '"use strict";'
      };
    }
  }
});
