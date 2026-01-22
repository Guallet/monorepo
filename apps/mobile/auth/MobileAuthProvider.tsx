import React, { useCallback } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { BuildConfig } from '@/BuildConfig';
import { setAnalyticsDeviceId } from '@/utils/analytics';
import { AuthProvider as BaseAuthProvider } from '@guallet/auth';
import { authClient } from './authClient';

console.log(
  'Configuring Google Signin with webClientId:',
  BuildConfig.Auth.GOOGLE_WEB_CLIENT_ID,
);
GoogleSignin.configure({
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  webClientId: BuildConfig.Auth.GOOGLE_WEB_CLIENT_ID,
});

interface MobileAuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: Readonly<MobileAuthProviderProps>) {
  const handleUserChange = useCallback(async (userId: string | null) => {
    await setAnalyticsDeviceId(userId);
  }, []);

  return (
    <BaseAuthProvider authClient={authClient} onUserChange={handleUserChange}>
      {children}
    </BaseAuthProvider>
  );
}
