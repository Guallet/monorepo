import { createBetterAuthClient } from '@guallet/auth';
import { BuildConfig } from '@/BuildConfig';

export const authClient = createBetterAuthClient({
  baseURL: BuildConfig.BASE_API_URL,
  basePath: '/auth',
});
