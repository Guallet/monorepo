import { resolve } from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    sequence: {
      hooks: 'list',
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,js}'],
      exclude: ['src/**/*.spec.ts'],
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      src: resolve(__dirname, './src'),
      '@thallesp/nestjs-better-auth': resolve(
        __dirname,
        './src/__mocks__/@thallesp/nestjs-better-auth/index.js',
      ),
    },
  },
});
