import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ["test/*.js"],
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
    },
  },
});
