import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      enabled: true,
      reporter: ['text', 'lcov', 'clover'],
      exclude: [...configDefaults.exclude, '**/tests/**']
    }
  },
  esbuild: {
    target: 'es2022'
  }
});
