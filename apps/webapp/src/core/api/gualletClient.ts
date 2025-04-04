import { BuildConfig } from "@/build.config";
import { createClient } from "@guallet/api-client";
import { supabase } from "@/core/auth/supabase";

// eslint-disable-next-line react-refresh/only-export-components
export const gualletClient = createClient({
  baseUrl: BuildConfig.BASE_API_URL,
  tokenHelper: {
    getAccessToken: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    },
  },
});
