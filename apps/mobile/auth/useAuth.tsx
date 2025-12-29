import { Provider, Session } from '@supabase/supabase-js';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { BuildConfig } from '@/BuildConfig';

interface AuthContextType {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  session?: Session | null;
  isLoading: boolean;

  getOtpCode: (email: string) => Promise<boolean>;
  loginWithProvider: (provider: Provider) => Promise<boolean>;
}

const AuthContext = React.createContext<AuthContextType>({
  signIn: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  session: null,
  isLoading: false,
  getOtpCode: (_email: string) => Promise.resolve(false),
  loginWithProvider: (_provider: Provider) => Promise.resolve(false),
});

console.log(
  'Configuring Google Signin with webClientId:',
  BuildConfig.Auth.GOOGLE_WEB_CLIENT_ID,
);
GoogleSignin.configure({
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  webClientId: BuildConfig.Auth.GOOGLE_WEB_CLIENT_ID,
});

// This hook can be used to access the user info.
export function useAuth() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useAuth must be wrapped in a <AuthProvider />');
    }
  }

  return value;
}

export function AuthProvider(props: Readonly<React.PropsWithChildren>) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .catch((error) => {
        setSession(null);
        console.error('Error loading the session', error);
      })
      .finally(() => {
        setIsLoading(false);
      });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const getOtpCodeFunction = useMemo(
    () => async (email: string) => {
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
    },
    [],
  );

  const loginWithProviderFunction = useMemo(
    () => async (provider: Provider) => {
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
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        signIn: async () => {
          // Perform sign-in logic here
          //   setSession("xxx");
        },
        signOut: async () => {
          await supabase.auth.signOut();
        },
        session,
        isLoading,
        getOtpCode: getOtpCodeFunction,
        loginWithProvider: loginWithProviderFunction,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
