import React, { useCallback } from 'react';
import { AuthProvider as BaseAuthProvider, useAuth as useBaseAuth } from '@guallet/auth';
import type { AuthResult } from '@guallet/auth';
import { supabase } from './supabase';
import type { Provider } from '@supabase/supabase-js';

interface WebAppAuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: Readonly<WebAppAuthProviderProps>) {
  return (
    <BaseAuthProvider supabaseClient={supabase}>
      {children}
    </BaseAuthProvider>
  );
}

// Custom hook that provides webapp-specific auth methods
export function useAuth() {
  const baseAuth = useBaseAuth();

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
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
    return { success: true as const };
  }, []);

  const createAccount = useCallback(async ({
    name,
    email,
    password,
  }: {
    email: string;
    password: string;
    name: string;
  }): Promise<AuthResult<{ userId: string }>> => {
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
  }, []);

  const loginWithProvider = useCallback(async (provider: string): Promise<AuthResult> => {
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
  }, []);

  return {
    ...baseAuth,
    login,
    createAccount,
    loginWithProvider,
  };
}
