import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import type {
  SupabaseClient,
  AuthChangeEvent,
  Session,
  Provider,
} from '@supabase/supabase-js';
import { AuthContext, AuthResult, ExternalAuthProvider } from './AuthContext';

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: React.ReactNode;
  supabaseClient: SupabaseClient;
  onUserChange?: (userId: string | null) => void;
}

export function AuthProvider({
  children,
  supabaseClient,
  onUserChange,
}: Readonly<AuthProviderProps>) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initAuth();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        onSessionChanged(event, session);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabaseClient, onUserChange]);

  const onSessionChanged = useCallback(
    async (_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      setIsAuthenticated(session !== null);
      if (onUserChange) {
        onUserChange(session?.user?.id ?? null);
      }
    },
    [onUserChange],
  );

  const initAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) {
        throw error;
      }
      setSession(data.session);
      setIsAuthenticated(data.session !== null);
    } catch (error) {
      setSession(null);
      setIsAuthenticated(false);
      console.error('Error initializing auth', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabaseClient]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error('Error logging in', error);
        return {
          success: false,
          error: {
            code: error.code ?? 'login_error',
            message: error.message,
          },
        };
      }

      return { success: true, error: null };
    },
    [supabaseClient],
  );

  const createAccount = useCallback(
    async ({
      name,
      email,
      password,
    }: {
      email: string;
      password: string;
      name: string;
    }): Promise<AuthResult> => {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      if (error) {
        console.error('Error creating account', error);
        return {
          success: false,
          error: {
            code: error.code ?? 'signup_error',
            message: error.message,
          },
        };
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        return {
          success: false,
          error: {
            code: 'email_confirmation_required',
            message:
              'Please check your email to confirm your account before logging in.',
          },
        };
      }

      return {
        success: true,
        error: null,
      };
    },
    [supabaseClient],
  );

  const loginWithProvider = useCallback(
    async (
      provider: ExternalAuthProvider,
      redirectUrl: string,
    ): Promise<AuthResult> => {
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
            success: false,
            error: {
              code: 'unsupported_provider',
              message: `Provider '${provider}' is not supported`,
            },
          };
      }

      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: supabaseProvider,
        options: {
          // redirectTo: `${globalThis.location.origin}/login/callback`,
          redirectTo: redirectUrl,
        },
      });
      if (error) {
        console.error('Error logging in with provider', error);
        return {
          success: false,
          error: {
            code: error.code ?? 'oauth_error',
            message: error.message,
          },
        };
      }
      return { success: true, error: null };
    },
    [supabaseClient],
  );

  const getOtpCode = useCallback(
    async (email: string): Promise<AuthResult> => {
      const { error } = await supabaseClient.auth.signInWithOtp({
        email,
      });
      if (error) {
        console.error('Error sending OTP code', error);
        return {
          success: false,
          error: {
            code: error.code ?? 'otp_error',
            message: error.message,
          },
        };
      }

      return { success: true, error: null };
    },
    [supabaseClient],
  );

  const verifyOtpCode = useCallback(
    async (email: string, code: string): Promise<AuthResult> => {
      const { error } = await supabaseClient.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });
      if (error) {
        console.error('Error verifying OTP code', error);
        return {
          success: false,
          error: {
            code: error.code ?? 'otp_verification_error',
            message: error.message,
          },
        };
      }

      return { success: true, error: null };
    },
    [supabaseClient],
  );

  const logout = useCallback(async (): Promise<AuthResult> => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      console.error('Error during sign out', error);
      return {
        success: false,
        error: {
          code: error.code ?? 'logout_error',
          message: error.message,
        },
      };
    }
    return { success: true, error: null };
  }, [supabaseClient]);

  const memoizedState = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      userId: session?.user?.id ?? null,

      login: login,
      createAccount: createAccount,
      loginWithProvider: loginWithProvider,
      logout: logout,
      getOtpCode: getOtpCode,
      verifyOtpCode: verifyOtpCode,
    }),
    [
      isLoading,
      isAuthenticated,
      session,
      login,
      createAccount,
      loginWithProvider,
      logout,
      getOtpCode,
      verifyOtpCode,
    ],
  );

  return (
    <AuthContext.Provider value={memoizedState}>
      {children}
    </AuthContext.Provider>
  );
}
