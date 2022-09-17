import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    deps: {
      inline: true
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
