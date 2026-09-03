import { transform } from '@swc/core';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    {
      name: 'swc-typescript',
      enforce: 'pre',
      async transform(code, id) {
        if (!id.endsWith('.ts') || id.includes('/node_modules/')) {
          return undefined;
        }

        const result = await transform(code, {
          filename: id,
          sourceMaps: true,
          jsc: {
            target: 'es2023',
            parser: {
              syntax: 'typescript',
              decorators: true,
            },
            transform: {
              legacyDecorator: true,
              decoratorMetadata: true,
              useDefineForClassFields: false,
            },
          },
          module: { type: 'es6' },
        });

        return {
          code: result.code,
          map: result.map ?? null,
        };
      },
    },
  ],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    exclude: ['test/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,js}'],
      exclude: ['src/**/*.spec.ts'],
      reporter: ['text', 'lcov'],
    },
  },
});
