export const BuildConfig = {
  IS_PRODUCTION: import.meta.env.PROD,
  BASE_API_URL: import.meta.env.VITE_API_URL,
  AUTH: {
    SUPABASE: {
      URL: import.meta.env.VITE_SUPABASE_URL,
      KEY: import.meta.env.VITE_SUPABASE_KEY,
    },
  },
};
