import { BuildConfig } from "@/build.config";
import { createClient } from "@guallet/api-client";
import { authClient } from "@/auth/better-auth";

export const gualletClient = createClient({
  baseUrl: BuildConfig.BASE_API_URL,
  tokenHelper: {
    getAccessToken: async () => {
      const { data } = await authClient.getSession();
      return data?.session?.id ?? null;
    },
  },
});
