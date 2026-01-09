import { Provider, Session } from '@supabase/supabase-js';
import React, { useCallback, useMemo } from 'react';
import { supabase } from './supabase';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { BuildConfig } from '@/BuildConfig';
import { setAnalyticsDeviceId } from '@/utils/analytics';
import { AuthProvider as BaseAuthProvider, useAuth as useBaseAuth } from '@guallet/auth';

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
  const handleSessionChange = useCallback(async (session: Session | null) => {
    await setAnalyticsDeviceId(session?.user?.id ?? null);
  }, []);

  return (
    <BaseAuthProvider supabaseClient={supabase} onSessionChange={handleSessionChange}>
      {children}
    </BaseAuthProvider>
  );
}

// Custom hook that provides mobile-specific auth methods
export function useAuth() {
  const baseAuth = useBaseAuth();

  const getOtpCode = useCallback(async (email: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'guallet://login/callback',
      },
    });
    if (error) {
      console.error('Error sending OTP', error);
      return false;
    }
    return true;
  }, []);

  const loginWithProvider = useCallback(async (provider: Provider): Promise<boolean> => {
    if (provider !== 'google') {
      console.warn('Only Google provider is supported currently.');
      return false;
    }

    try {
      console.log('Starting Google sign-in process...');
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (userInfo?.data?.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.data.idToken,
        });
        console.log(error, data);
        return error == null;
      } else {
        throw new Error('no ID token present!');
      }
    } catch (error: any) {
      console.error('Error during Google sign-in', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }

      throw error;
    }
  }, []);

  const signIn = useCallback(async () => {
    // Perform sign-in logic here if needed
    //   setSession("xxx");
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return useMemo(
    () => ({
      ...baseAuth,
      signIn,
      signOut,
      getOtpCode,
      loginWithProvider,
    }),
    [baseAuth, signIn, signOut, getOtpCode, loginWithProvider]
  );
}
