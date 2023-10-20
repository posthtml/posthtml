import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    include: ["test/*.js"],
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
    },
  },
});
