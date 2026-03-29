import { createBetterAuthClient } from '@guallet/auth';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';
import { BuildConfig } from '@/BuildConfig';

export const authClient = createBetterAuthClient({
  baseURL: BuildConfig.BASE_API_URL,
  basePath: '/auth',
  plugins: [
    expoClient({
      scheme: 'guallet',
      storagePrefix: 'guallet',
      storage: SecureStore,
    }),
  ],
});
