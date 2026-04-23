import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
    css: {
      modules: {
        // Class names stay as written (no hash) — predictable in tests
        classNameStrategy: 'non-scoped',
      },
    },
  },
});
