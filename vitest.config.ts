import { configDefaults, coverageConfigDefaults, defineConfig } from 'vitest/config';

const sourceTestGlobs = [
  'packages/**/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
  'demos/**/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
];

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    watch: false,
    isolate: false,
    include: sourceTestGlobs,
    exclude: [...configDefaults.exclude, '**/build/**', '**/publish/**', '**/.next/**', '**/.nx/**', '**/.turbo/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [...coverageConfigDefaults.exclude, '**/scripts/**', '**/publish/**'],
    },
  },
});
