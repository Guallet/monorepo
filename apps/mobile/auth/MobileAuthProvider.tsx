import React, { useCallback, useMemo } from 'react';
import { supabase } from './supabase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { BuildConfig } from '@/BuildConfig';
import { setAnalyticsDeviceId } from '@/utils/analytics';
import { AuthProvider as BaseAuthProvider } from '@guallet/auth';

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
    <BaseAuthProvider supabaseClient={supabase} onUserChange={handleUserChange}>
      {children}
    </BaseAuthProvider>
  );
}
