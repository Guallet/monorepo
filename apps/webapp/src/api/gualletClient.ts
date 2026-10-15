import { BuildConfig } from '@/build.config';
import { createClient } from '@guallet/api-client';

export const gualletClient = createClient({
  baseUrl: BuildConfig.BASE_API_URL,
});
