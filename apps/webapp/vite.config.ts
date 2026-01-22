import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import dns from 'node:dns';

// To enable path alias
import { fileURLToPath, URL } from 'node:url';

// Don't use 127.0.0.1, but "localhost".
// This is required for the auth redirect allowed domains
dns.setDefaultResultOrder('verbatim');

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
    open: true,
  },

  plugins: [
    tanstackRouter({
      autoCodeSplitting: true,
    }), // React Compiler is enabled to automatically optimize React components
    // Docs: https://react.dev/learn/react-compiler
    react({
      babel: {
        plugins: [
          [
            'babel-plugin-react-compiler',
            {
              // Uncomment to see compilation logs
              // compilationMode: "annotation", // Only compile components with "use memo" pragma
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
