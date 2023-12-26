/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_POSTHOG_ENABLED: string;
  readonly VITE_POSTHOG_API_URL: string;
  readonly VITE_POSTHOG_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
