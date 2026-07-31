import * as path from 'path';
import { defineConfig } from 'vitest/config';

// Vitest 4 dropped standalone `vitest.workspace.ts` support; `test.projects` on the
// root config is the replacement mechanism for multi-project runs.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'api',
          environment: 'node',
          root: './apps/api',
          include: ['test/**/*.test.js'],
          setupFiles: ['./test/setup.js'],
        },
      },
      {
        // Mirrors apps/web/vite.config.ts's `@` alias — a separate project config, so it
        // isn't inherited automatically.
        resolve: {
          alias: { '@': path.resolve(__dirname, './apps/web/src') },
        },
        test: {
          name: 'web',
          environment: 'jsdom',
          root: './apps/web',
          include: ['src/**/*.test.{ts,tsx}'],
          setupFiles: ['./src/test/setup.ts'],
        },
      },
    ],
  },
});
