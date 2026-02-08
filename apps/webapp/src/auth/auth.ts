import { createBetterAuthClient } from '@guallet/auth';

export const authClient = createBetterAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
  basePath: '/auth',
});
