import React, { useState, useContext, useEffect } from 'react';

import { AuthChangeEvent, Provider, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { AuthContext, AuthContextType } from '@/auth/AuthContext';

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: React.ReactNode;
}
export function AuthProvider({ children }: Readonly<AuthProviderProps>) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function onSessionChanged(
    _event: AuthChangeEvent,
    session: Session | null,
  ) {
    setSession(session);
    setIsAuthenticated(session !== null);
  }

  useEffect(() => {
    console.log('Initializing auth');
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

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        onSessionChanged(event, session);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('Error logging in', error);
      return {
        success: false as const,
        error: {
          code: error.code ?? 'login_error',
          message: error.message,
        },
      };
    }
    setIsAuthenticated(true);
    return { success: true as const };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const createAccount = async ({
    name,
    email,
    password,
  }: {
    email: string;
    password: string;
    name: string;
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error) {
      console.error('Error creating account', error);
      return {
        success: false as const,
        error: {
          code: error.code ?? 'signup_error',
          message: error.message,
        },
      };
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      return {
        success: false as const,
        error: {
          code: 'email_confirmation_required',
          message:
            'Please check your email to confirm your account before logging in.',
        },
      };
    }

    return {
      success: true as const,
      data: { userId: data.user?.id ?? '' },
    };
  };

  const loginWithProvider = async (provider: string) => {
    let supabaseProvider: Provider | null = null;
    switch (provider) {
      case 'google':
        supabaseProvider = 'google';
        break;
      case 'github':
        supabaseProvider = 'github';
        break;
      case 'microsoft':
        supabaseProvider = 'azure';
        break;
      default:
        console.error('Unsupported provider');
        return {
          success: false as const,
          error: {
            code: 'unsupported_provider',
            message: `Provider '${provider}' is not supported`,
          },
        };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: supabaseProvider,
      options: {
        redirectTo: `${window.location.origin}/login/callback`,
      },
    });
    if (error) {
      console.error('Error logging in with provider', error);
      return {
        success: false as const,
        error: {
          code: error.code ?? 'oauth_error',
          message: error.message,
        },
      };
    }
    return { success: true as const };
  };

  const state: AuthContextType = {
    isLoading: isLoading,
    isAuthenticated: isAuthenticated,
    userId: session?.user?.id ?? null,
    login: login,
    logout: logout,
    createAccount: createAccount,
    loginWithProvider: loginWithProvider,
  };

  const memoizedState = React.useMemo(
    () => state,
    [
      isLoading,
      isAuthenticated,
      session?.user?.id,
      login,
      logout,
      createAccount,
      loginWithProvider,
    ],
  );

  return (
    <AuthContext.Provider value={memoizedState}>
      {children}
    </AuthContext.Provider>
  );
}
