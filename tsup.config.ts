import { polyfillNode as esbuildPluginPolyfillNode } from 'esbuild-plugin-polyfill-node';
import { relative, resolve } from 'node:path';
import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  format: ['cjs', 'esm', 'iife'],
  globalName: 'JoshCore',
  minify: false,
  skipNodeModulesBundle: true,
  sourcemap: true,
  target: 'es2022',
  tsconfig: relative(__dirname, resolve(process.cwd(), 'src', 'tsconfig.json')),
  keepNames: true,
  esbuildPlugins: [esbuildPluginPolyfillNode({ globals: { process: true } })],
  treeshake: true
});
