export const BuildConfig = {
  BASE_API_URL: process.env.EXPO_PUBLIC_API_URL ?? "",
  Auth: {
    GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
    SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
    SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? "",
  },
} as const;
