import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['packages/**/*.spec.ts'],
    exclude: ['node_modules', 'build', 'dist'],
  },
});
