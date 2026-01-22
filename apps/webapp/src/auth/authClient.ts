import { createGualletAuthClient } from '@guallet/auth';
import { BuildConfig } from '@/build.config';

// Create the auth client pointing to the API's auth endpoints
export const authClient = createGualletAuthClient({
  baseURL: BuildConfig.BASE_API_URL,
});
