import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['functions/**/*.spec.ts'],
    exclude: ['node_modules', 'build', 'dist'],
  },
});
