import dns from 'node:dns';
import { fileURLToPath, URL } from 'node:url';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';

// Don't use 127.0.0.1, but "localhost".
// This is required for the better-auth redirect allowed domains
dns.setDefaultResultOrder('verbatim');

export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
    open: true,
  },
  plugins: [
    // tanstackStart replaces tanstackRouter and adds SSR entry wiring,
    // server functions, and code splitting out of the box.
    tanstackStart(),
    // React Compiler is enabled to automatically optimize React components
    // Docs: https://react.dev/learn/react-compiler
    react({
      babel: {
        plugins: [
          [
            'babel-plugin-react-compiler',
            {
              // Uncomment to see compilation logs
              // compilationMode: 'annotation', // Only compile components with "use memo" pragma
            },
          ],
        ],
      },
    }),
    sentryVitePlugin({
      org: 'guallet',
      project: 'webapp',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    sourcemap: true,
  },
});
