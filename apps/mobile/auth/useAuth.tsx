import { Provider } from '@supabase/supabase-js';
import { useCallback, useMemo } from 'react';
import { supabase } from './supabase';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useAuth as useBaseAuth } from '@guallet/auth';

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
      return false;
    }
    return true;
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'guallet://login/reset-password',
    });
    if (error) {
      return false;
    }
    return true;
  }, []);

  const loginWithProvider = useCallback(
    async (provider: Provider): Promise<boolean> => {
      if (provider !== 'google') {
        return false;
      }

      try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        if (userInfo?.data?.idToken) {
          const { error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: userInfo.data.idToken,
          });
          return error == null;
        } else {
          throw new Error('no ID token present!');
        }
      } catch (error: any) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
          case statusCodes.IN_PROGRESS:
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            break;
          default:
            throw error;
        }
        return false;
      }
    },
    [],
  );

  const signIn = useCallback(async () => {
    // Perform sign-in logic here if needed
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
      resetPassword,
      loginWithProvider,
    }),
    [baseAuth, signIn, signOut, getOtpCode, resetPassword, loginWithProvider],
  );
}
