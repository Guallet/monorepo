import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import dns from 'node:dns';

// To enable path alias
import { fileURLToPath, URL } from 'node:url';

// Don't use 127.0.0.1, but "localhost".
// This is required for the better-auth redirect allowed domains
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
    // plugin-react v6 dropped the `babel` option; the compiler is now attached
    // through @rolldown/plugin-babel with the shared reactCompilerPreset.
    react(),
    babel({
      presets: [reactCompilerPreset()],
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
