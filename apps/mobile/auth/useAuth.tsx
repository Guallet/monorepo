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
      console.error('Error sending OTP', error);
      return false;
    }
    return true;
  }, []);

  const loginWithProvider = useCallback(
    async (provider: Provider): Promise<boolean> => {
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
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            // user cancelled the login flow
            console.log('User cancelled the login flow');
            break;
          case statusCodes.IN_PROGRESS:
            // operation (e.g. sign in) is in progress already
            console.log('Sign-in is in progress already');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // play services not available or outdated
            console.log('Play services not available or outdated');
            break;
          default:
            // some other error happened
            console.log('Some other error happened:', error);
        }

        throw error;
      }
    },
    [],
  );

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
    [baseAuth, signIn, signOut, getOtpCode, loginWithProvider],
  );
}
