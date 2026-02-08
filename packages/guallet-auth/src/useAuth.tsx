import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  use,
} from 'react';
import { AuthContext, AuthResult, ExternalAuthProvider } from './AuthContext';
import { createGualletAuthClient } from 'auth';

type BetterAuthClient = ReturnType<typeof createGualletAuthClient>;

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: React.ReactNode;
  authClient: BetterAuthClient;
  onUserChange?: (userId: string | null) => void;
}

export function AuthProvider({
  children,
  authClient,
  onUserChange,
}: Readonly<AuthProviderProps>) {
  const { data: session, isPending, refetch } = authClient.useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const initializeAuth = useCallback(async () => {
    console.log('Initializing auth session...');
    const session = await authClient.getSession();
    const authenticated = session?.data?.user?.id !== undefined;
    setIsAuthenticated(authenticated);
    console.log('Initial session: isAuthenticated:', authenticated);
  }, [refetch, onUserChange]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    const authenticated = session?.user?.id !== undefined;
    setIsAuthenticated(authenticated);
    console.log('Session updated: isAuthenticated:', authenticated);

    if (onUserChange) {
      onUserChange(session?.user?.id ?? null);
    }
  }, [session, onUserChange]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const { data, error } = await authClient.signIn.email({
          email,
          password,
        });

        if (data) {
          console.log('Login successful', { userId: data.user?.id });
          // Refresh session to update isAuthenticated state
          await refetch();
        }

        if (error) {
          return {
            success: false,
            error: {
              code: error.code ?? 'login_error',
              message: error.message || 'Login failed',
            },
          };
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
    [authClient, refetch],
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
        const { error } = await authClient.signUp.email({
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

        // Refresh session to update isAuthenticated state (in case of auto-signin)
        await refetch();
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
    [authClient, refetch],
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
          type: 'sign-in',
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
        const { error } = await authClient.signIn.emailOtp({
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

        // Refresh session to update isAuthenticated state
        await refetch();
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
    [authClient, refetch],
  );

  const resetPassword = useCallback(
    async (newPassword: string, token: string): Promise<AuthResult> => {
      try {
        const { error } = await authClient.resetPassword({
          newPassword,
          token,
        });
        if (error) {
          return {
            success: false,
            error: {
              code: error.code ?? 'password_reset_error',
              message: error.message || 'Failed to reset password',
            },
          };
        }
        return { success: true, error: null };
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'password_reset_error',
            message: error.message || 'Failed to reset password',
          },
        };
      }
    },
    [authClient],
  );

  const logout = useCallback(async (): Promise<AuthResult> => {
    try {
      await authClient.signOut();
      // Refresh session to update isAuthenticated state
      await refetch();
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
  }, [authClient, refetch]);

  const memoizedState = useMemo(
    () => ({
      isLoading: isPending,
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
      isPending,
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
