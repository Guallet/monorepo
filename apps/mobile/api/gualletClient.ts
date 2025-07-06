import { supabase } from "@/auth/supabase";
import { BuildConfig } from "@/buildConfig";
import { createClient } from "@guallet/api-client";

export const gualletClient = createClient({
  baseUrl: BuildConfig.BASE_API_URL,
  tokenHelper: {
    getAccessToken: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    },
  },
});
