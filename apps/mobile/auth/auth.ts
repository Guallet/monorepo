import { expoClient } from '@better-auth/expo/client';
import { emailOTPClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';
import { BuildConfig } from '@/BuildConfig';

export const authClient = createAuthClient({
  baseURL: BuildConfig.BASE_API_URL,
  basePath: '/auth',
  plugins: [
    expoClient({
      scheme: 'guallet',
      storagePrefix: 'guallet',
      storage: SecureStore,
    }),
    emailOTPClient(),
  ],
});
