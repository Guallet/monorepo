import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { AuthContext, AuthResult, ExternalAuthProvider, AuthSession, AuthUser } from './AuthContext';
import type { GualletAuthClient } from './authClient';

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: React.ReactNode;
  authClient: GualletAuthClient;
  onUserChange?: (userId: string | null) => void;
}

// Helper to convert Better Auth errors to our AuthResult format
function handleAuthError(error: unknown): AuthResult {
  if (error && typeof error === 'object' && 'message' in error) {
    const err = error as { message?: string; code?: string };
    return {
      success: false,
      error: {
        code: err.code ?? 'auth_error',
        message: err.message ?? 'An authentication error occurred',
      },
    };
  }
  return {
    success: false,
    error: {
      code: 'unknown_error',
      message: 'An unknown error occurred',
    },
  };
}

export function AuthProvider({
  children,
  authClient,
  onUserChange,
}: Readonly<AuthProviderProps>) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const previousUserIdRef = useRef<string | null>(null);

  // Convert Better Auth session to our format
  const convertSession = useCallback((betterAuthSession: { session?: { token?: string; expiresAt?: Date }; user?: { id?: string; email?: string; name?: string; image?: string; emailVerified?: boolean } } | null): AuthSession | null => {
    if (!betterAuthSession?.session || !betterAuthSession?.user) {
      return null;
    }
    return {
      token: betterAuthSession.session.token ?? '',
      expiresAt: betterAuthSession.session.expiresAt ? new Date(betterAuthSession.session.expiresAt) : new Date(),
      user: {
        id: betterAuthSession.user.id ?? '',
        email: betterAuthSession.user.email ?? '',
        name: betterAuthSession.user.name,
        image: betterAuthSession.user.image,
        emailVerified: betterAuthSession.user.emailVerified,
      },
    };
  }, []);

  // Initialize auth and subscribe to changes
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const sessionData = await authClient.getSession();
        const convertedSession = convertSession(sessionData.data);
        setSession(convertedSession);
        setUser(convertedSession?.user ?? null);
        setIsAuthenticated(convertedSession !== null);
      } catch (error) {
        console.error('Error initializing auth', error);
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Subscribe to session changes using Better Auth's useSession
    // Note: In React, we'll use the built-in subscription from Better Auth
    const unsubscribe = authClient.$store.session.listen((sessionData) => {
      const convertedSession = convertSession(sessionData);
      setSession(convertedSession);
      setUser(convertedSession?.user ?? null);
      setIsAuthenticated(convertedSession !== null);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [authClient, convertSession]);

  // Notify parent of user changes
  useEffect(() => {
    const currentUserId = user?.id ?? null;
    if (previousUserIdRef.current !== currentUserId) {
      previousUserIdRef.current = currentUserId;
      if (onUserChange) {
        onUserChange(currentUserId);
      }
    }
  }, [user, onUserChange]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const result = await authClient.signIn.email({
          email,
          password,
        });
        if (result.error) {
          return handleAuthError(result.error);
        }
        return { success: true, error: null };
      } catch (error) {
        console.error('Error logging in', error);
        return handleAuthError(error);
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
        const result = await authClient.signUp.email({
          email,
          password,
          name,
        });
        if (result.error) {
          return handleAuthError(result.error);
        }

        // Check if email verification is required
        if (result.data && !result.data.session) {
          return {
            success: false,
            error: {
              code: 'email_confirmation_required',
              message:
                'Please check your email to confirm your account before logging in.',
            },
          };
        }

        return { success: true, error: null };
      } catch (error) {
        console.error('Error creating account', error);
        return handleAuthError(error);
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
        const result = await authClient.signIn.social({
          provider,
          callbackURL: redirectUrl,
        });
        if (result.error) {
          return handleAuthError(result.error);
        }
        return { success: true, error: null };
      } catch (error) {
        console.error('Error logging in with provider', error);
        return handleAuthError(error);
      }
    },
    [authClient],
  );

  const sendMagicLink = useCallback(
    async (email: string, redirectUrl: string): Promise<AuthResult> => {
      try {
        const result = await authClient.signIn.magicLink({
          email,
          callbackURL: redirectUrl,
        });
        if (result.error) {
          return handleAuthError(result.error);
        }
        return { success: true, error: null };
      } catch (error) {
        console.error('Error sending magic link', error);
        return handleAuthError(error);
      }
    },
    [authClient],
  );

  const sendOtpEmail = useCallback(
    async (email: string): Promise<AuthResult> => {
      try {
        const result = await authClient.signIn.emailOtp({
          email,
        });
        if (result.error) {
          return handleAuthError(result.error);
        }
        return { success: true, error: null };
      } catch (error) {
        console.error('Error sending OTP code', error);
        return handleAuthError(error);
      }
    },
    [authClient],
  );

  const verifyOtp = useCallback(
    async (email: string, otp: string): Promise<AuthResult> => {
      try {
        const result = await authClient.signIn.emailOtp({
          email,
          otp,
        });
        if (result.error) {
          return handleAuthError(result.error);
        }
        return { success: true, error: null };
      } catch (error) {
        console.error('Error verifying OTP code', error);
        return handleAuthError(error);
      }
    },
    [authClient],
  );

  const forgotPassword = useCallback(
    async (email: string, redirectUrl: string): Promise<AuthResult> => {
      try {
        const result = await authClient.forgetPassword({
          email,
          redirectTo: redirectUrl,
        });
        if (result.error) {
          return handleAuthError(result.error);
        }
        return { success: true, error: null };
      } catch (error) {
        console.error('Error sending password reset email', error);
        return handleAuthError(error);
      }
    },
    [authClient],
  );

  const resetPassword = useCallback(
    async (newPassword: string): Promise<AuthResult> => {
      try {
        const result = await authClient.resetPassword({
          newPassword,
        });
        if (result.error) {
          return handleAuthError(result.error);
        }
        return { success: true, error: null };
      } catch (error) {
        console.error('Error resetting password', error);
        return handleAuthError(error);
      }
    },
    [authClient],
  );

  const logout = useCallback(async (): Promise<AuthResult> => {
    try {
      await authClient.signOut();
      return { success: true, error: null };
    } catch (error) {
      console.error('Error during sign out', error);
      return handleAuthError(error);
    }
  }, [authClient]);

  const getSession = useCallback(async (): Promise<AuthSession | null> => {
    try {
      const result = await authClient.getSession();
      return convertSession(result.data);
    } catch (error) {
      console.error('Error getting session', error);
      return null;
    }
  }, [authClient, convertSession]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const sessionResult = await authClient.getSession();
      return sessionResult.data?.session?.token ?? null;
    } catch (error) {
      console.error('Error getting access token', error);
      return null;
    }
  }, [authClient]);

  const memoizedState = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      userId: user?.id ?? null,
      user,
      session,
      login,
      createAccount,
      loginWithProvider,
      sendMagicLink,
      sendOtpEmail,
      verifyOtp,
      forgotPassword,
      resetPassword,
      logout,
      getSession,
      getAccessToken,
    }),
    [
      isLoading,
      isAuthenticated,
      user,
      session,
      login,
      createAccount,
      loginWithProvider,
      sendMagicLink,
      sendOtpEmail,
      verifyOtp,
      forgotPassword,
      resetPassword,
      logout,
      getSession,
      getAccessToken,
    ],
  );

  return (
    <AuthContext.Provider value={memoizedState}>
      {children}
    </AuthContext.Provider>
  );
}
