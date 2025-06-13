import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';


export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    setupFiles: './vitest.setup.js',
    environment: 'jsdom',
    env: loadEnv('development', process.cwd(), ''),
    coverage: {
      provider: 'v8',
      reporter: ['json-summary', 'text', 'json', 'html'],
      reportsDirectory: './coverage',
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [],
    },
  },
});
