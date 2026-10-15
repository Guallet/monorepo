import { BuildConfig } from '@/BuildConfig';
import { authClient } from '@/auth/auth';
import { createClient } from '@guallet/api-client';

export const gualletClient = createClient({
  baseUrl: BuildConfig.BASE_API_URL,
  cookieHelper: {
    getCookie: () => authClient.getCookie(),
  },
});
