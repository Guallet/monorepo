import { BuildConfig } from '@/BuildConfig';
import { authClient } from '@/auth/auth';
import { createClient } from '@guallet/api-client';

export const gualletClient = createClient({
  baseUrl: BuildConfig.BASE_API_URL,
  tokenHelper: {
    getAccessToken: async () => {
      const { data } = await authClient.getSession();
      return data?.session?.id ?? null;
    },
  },
});
