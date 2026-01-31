import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { AuthContext, AuthResult, ExternalAuthProvider } from './AuthContext';

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: React.ReactNode;
  authClient: any; // Type this properly if possible, or use 'any' for now as better-auth client type is complex
  onUserChange?: (userId: string | null) => void;
}

export function AuthProvider({
  children,
  authClient,
  onUserChange,
}: Readonly<AuthProviderProps>) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const initAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await authClient.getSession();
      setSession(data?.session ?? null);
      setIsAuthenticated(!!data?.session);
      if (onUserChange) {
        onUserChange(data?.user?.id ?? null);
      }
    } catch (error) {
      setSession(null);
      setIsAuthenticated(false);
      console.error('Error initializing auth', error);
    } finally {
      setIsLoading(false);
    }
  }, [authClient, onUserChange]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const { data, error } = await authClient.signIn.email({
          email,
          password,
        });

        if (error) {
          return {
            success: false,
            error: {
              code: error.code ?? 'login_error',
              message: error.message || 'Login failed',
            },
          };
        }

        setSession(data.session);
        setIsAuthenticated(true);
        if (onUserChange) {
          onUserChange(data.user.id);
        }
        return { success: true, error: null };
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'unexpected_error',
            message: error.message || 'An unexpected error occurred',
          },
        };
      }
    },
    [authClient, onUserChange],
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
      try {
        const { data, error } = await authClient.signUp.email({
          email,
          password,
          name,
        });

        if (error) {
          return {
            success: false,
            error: {
              code: error.code ?? 'signup_error',
              message: error.message || 'Signup failed',
            },
          };
        }

        setSession(data.session);
        setIsAuthenticated(true);
        if (onUserChange) {
          onUserChange(data.user.id);
        }
        return { success: true, error: null };
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'unexpected_error',
            message: error.message || 'An unexpected error occurred',
          },
        };
      }
    },
    [authClient, onUserChange],
  );

  const loginWithProvider = useCallback(
    async (
      provider: ExternalAuthProvider,
      redirectUrl: string,
    ): Promise<AuthResult> => {
      try {
        await authClient.signIn.social({
          provider,
          callbackURL: redirectUrl,
        });
        return { success: true, error: null };
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'oauth_error',
            message: error.message || 'OAuth login failed',
          },
        };
      }
    },
    [authClient],
  );

  const getOtpCode = useCallback(
    async (email: string): Promise<AuthResult> => {
      try {
        const { error } = await authClient.emailOtp.sendVerificationOtp({
          email,
          type: "sign-in"
        });
        if (error) {
          return {
            success: false,
            error: {
              code: error.code ?? 'otp_error',
              message: error.message || 'Failed to send OTP',
            },
          };
        }
        return { success: true, error: null };
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'otp_error',
            message: error.message || 'Failed to send OTP',
          },
        };
      }
    },
    [authClient],
  );

  const verifyOtpCode = useCallback(
    async (email: string, code: string): Promise<AuthResult> => {
      try {
        const { data, error } = await authClient.signIn.emailOtp({
          email,
          otp: code,
        });
        if (error) {
          return {
            success: false,
            error: {
              code: error.code ?? 'otp_verification_error',
              message: error.message || 'Failed to verify OTP',
            },
          };
        }
        setSession(data.session);
        setIsAuthenticated(true);
        if (onUserChange) {
          onUserChange(data.user.id);
        }
        return { success: true, error: null };
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'otp_verification_error',
            message: error.message || 'Failed to verify OTP',
          },
        };
      }
    },
    [authClient, onUserChange],
  );

  const resetPassword = useCallback(
    async (email: string, redirectUrl: string): Promise<AuthResult> => {
      try {
        const { error } = await authClient.forgetPassword({
          email,
          redirectTo: redirectUrl,
        });
        if (error) {
          return {
            success: false,
            error: {
              code: error.code ?? 'password_reset_error',
              message: error.message || 'Failed to send reset email',
            },
          };
        }
        return { success: true, error: null };
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'password_reset_error',
            message: error.message || 'Failed to send reset email',
          },
        };
      }
    },
    [authClient],
  );

  const logout = useCallback(async (): Promise<AuthResult> => {
    try {
      await authClient.signOut();
      setSession(null);
      setIsAuthenticated(false);
      if (onUserChange) {
        onUserChange(null);
      }
      return { success: true, error: null };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'logout_error',
          message: error.message || 'Logout failed',
        },
      };
    }
  }, [authClient, onUserChange]);

  const memoizedState = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      userId: session?.user?.id ?? null,

      login,
      createAccount,
      loginWithProvider,
      logout,
      getOtpCode,
      verifyOtpCode,
      resetPassword,
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
      resetPassword,
    ],
  );

  return (
    <AuthContext.Provider value={memoizedState}>
      {children}
    </AuthContext.Provider>
  );
}

