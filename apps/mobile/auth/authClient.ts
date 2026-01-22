import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';
import { BuildConfig } from '@/BuildConfig';

// Create the auth client with Expo-specific configuration
export const authClient = createAuthClient({
  baseURL: BuildConfig.BASE_API_URL,
  plugins: [
    expoClient({
      scheme: 'guallet', // Deep linking scheme
      storage: SecureStore, // Secure storage for tokens
    }),
  ],
});
