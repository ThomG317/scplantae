import { createRequire } from 'node:module';
import { fileURLToPath, URL } from 'node:url';
import { copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);
const packageJson = require('./package.json') as { version: string };

const requiredSupabaseEnvVariables = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'] as const;

const validateSupabaseBuildEnv = (env: Record<string, string>) => {
  const missingVariables = requiredSupabaseEnvVariables.filter((variable) => !env[variable]);

  if (missingVariables.length > 0) {
    throw new Error(`Missing required Supabase environment variable${missingVariables.length > 1 ? 's' : ''}: ${missingVariables.join(', ')}`);
  }
};

export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    validateSupabaseBuildEnv(loadEnv(mode, process.cwd(), 'VITE_'));
  }

  return {
    base: '/scplantae/',
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version),
    },
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      rollupOptions: {
        plugins: [
          {
            name: 'static-hosting-spa-fallback',
            writeBundle: async (options) => {
              const outputDirectory = resolve(options.dir ?? 'dist');
              await copyFile(resolve(outputDirectory, 'index.html'), resolve(outputDirectory, '404.html'));
            },
          },
        ],
      },
    },
    test: { environment: 'jsdom' },
  };
});
