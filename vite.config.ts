import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Path aliases are declared here and inherited by Vitest through `mergeConfig`
 * in vitest.config.ts. They must stay in sync with `compilerOptions.paths`
 * in tsconfig.json.
 */
const fromRoot = (relativePath: string): string =>
  fileURLToPath(new URL(relativePath, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': fromRoot('./src/app'),
      '@application': fromRoot('./src/application'),
      '@domain': fromRoot('./src/domain'),
      '@infrastructure': fromRoot('./src/infrastructure'),
      '@presentation': fromRoot('./src/presentation'),
      '@test': fromRoot('./src/test'),
    },
  },
});
