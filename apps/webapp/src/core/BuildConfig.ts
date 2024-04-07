export const BuildConfig = {
  BASE_API_URL: import.meta.env.VITE_API_URL,
  Auth: {
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    SUPABASE_KEY: import.meta.env.VITE_SUPABASE_KEY,
  },
};
