import { authClient } from '@/auth/authClient';
import { BuildConfig } from '@/BuildConfig';
import { createClient } from '@guallet/api-client';

export const gualletClient = createClient({
  baseUrl: BuildConfig.BASE_API_URL,
  tokenHelper: {
    getAccessToken: async () => {
      const sessionData = await authClient.getSession();
      return sessionData.data?.session?.token ?? null;
    },
  },
});
