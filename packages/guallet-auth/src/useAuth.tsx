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
  const { data: session, isPending } = authClient.useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authenticated = session?.session?.id !== undefined;
    setIsAuthenticated(authenticated);
    console.log('Session updated', session, 'isAuthenticated:', authenticated);

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
    [authClient],
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
    [authClient],
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
    [authClient],
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
  }, [authClient]);

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
