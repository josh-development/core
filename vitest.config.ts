import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    deps: {
      inline:
        // TODO: Replace with true once https://github.com/vitest-dev/vitest/issues/2806 is fixed.
        [/^(?!.*vitest).*$/]
    },
    globals: true,
    coverage: {
      enabled: true,
      reporter: ['text', 'lcov', 'clover'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**']
    }
  },
  esbuild: {
    target: 'es2021'
  }
});
