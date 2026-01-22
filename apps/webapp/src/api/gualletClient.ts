import { BuildConfig } from "@/build.config";
import { createClient } from "@guallet/api-client";
import { authClient } from "@/auth/authClient";

export const gualletClient = createClient({
  baseUrl: BuildConfig.BASE_API_URL,
  tokenHelper: {
    getAccessToken: async () => {
      const sessionData = await authClient.getSession();
      return sessionData.data?.session?.token ?? null;
    },
  },
});
