/// <reference types="vite/client" />

// The package entrypoint is a CSS file, but the import specifier does not end
// in `.css`, so the wildcard `*.css` declaration does not cover it.
declare module '@fontsource-variable/inter';
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SENTRY_ENABLED: boolean;
  readonly VITE_SENTRY_DSN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
