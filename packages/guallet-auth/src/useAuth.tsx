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

/**
 * Better Auth session data type.
 * Using a flexible type because Better Auth's response structure depends on
 * server-side plugin configuration (e.g., emailOtp, magicLink plugins).
 */
interface BetterAuthSessionData {
  user?: {
    id: string;
    email: string;
    name?: string;
    image?: string | null;
    emailVerified?: boolean;
  };
  session?: {
    token: string;
    expiresAt: Date | string;
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

  /**
   * Cast authClient to access methods dynamically.
   * Better Auth's client API varies based on server-side plugin configuration,
   * so we use a flexible type here. Methods like forgetPassword, resetPassword,
   * signIn.social etc. are available based on the server configuration.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = authClient as any;

  // Convert Better Auth session to our format
  const convertSession = useCallback((betterAuthSession: BetterAuthSessionData | null): AuthSession | null => {
    if (!betterAuthSession?.user) {
      return null;
    }
    const token = betterAuthSession.session?.token ?? '';
    const expiresAt = betterAuthSession.session?.expiresAt;
    
    return {
      token,
      expiresAt: expiresAt ? new Date(expiresAt) : new Date(),
      user: {
        id: betterAuthSession.user.id ?? '',
        email: betterAuthSession.user.email ?? '',
        name: betterAuthSession.user.name ?? undefined,
        image: betterAuthSession.user.image ?? undefined,
        emailVerified: betterAuthSession.user.emailVerified ?? false,
      },
    };
  }, []);

  // Initialize auth and subscribe to changes
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const sessionData = await client.getSession();
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

    /**
     * Session state polling as a fallback mechanism.
     * Better Auth's reactive session management varies by client type.
     * This polling ensures session state stays in sync, especially for
     * token refresh scenarios. Interval is set to 5 minutes to minimize
     * unnecessary API calls while still catching expired sessions.
     */
    const pollInterval = setInterval(async () => {
      try {
        const sessionData = await client.getSession();
        const convertedSession = convertSession(sessionData.data);
        setSession(convertedSession);
        setUser(convertedSession?.user ?? null);
        setIsAuthenticated(convertedSession !== null);
      } catch (error) {
        console.error('Error polling session', error);
      }
    }, 300000); // Poll every 5 minutes

    return () => {
      clearInterval(pollInterval);
    };
  }, [client, convertSession]);

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
        const result = await client.signIn.email({
          email,
          password,
        });
        if (result.error) {
          return handleAuthError(result.error);
        }
        // Refresh session state after login
        const sessionData = await client.getSession();
        const convertedSession = convertSession(sessionData.data);
        setSession(convertedSession);
        setUser(convertedSession?.user ?? null);
        setIsAuthenticated(convertedSession !== null);
        return { success: true, error: null };
      } catch (error) {
        console.error('Error logging in', error);
        return handleAuthError(error);
      }
    },
    [client, convertSession],
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
        const result = await client.signUp.email({
          email,
          password,
          name,
        });
        if (result.error) {
          return handleAuthError(result.error);
        }

        // Check if user was created but not logged in (email verification required)
        if (result.data?.user && !result.data?.session) {
          return {
            success: false,
            error: {
              code: 'email_confirmation_required',
              message:
                'Please check your email to confirm your account before logging in.',
            },
          };
        }

        // Refresh session state after signup
        const sessionData = await client.getSession();
        const convertedSession = convertSession(sessionData.data);
        setSession(convertedSession);
        setUser(convertedSession?.user ?? null);
        setIsAuthenticated(convertedSession !== null);
        return { success: true, error: null };
      } catch (error) {
        console.error('Error creating account', error);
        return handleAuthError(error);
      }
    },
    [client, convertSession],
  );

  const loginWithProvider = useCallback(
    async (
      provider: ExternalAuthProvider,
      redirectUrl: string,
    ): Promise<AuthResult> => {
      try {
        const result = await client.signIn.social({
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
    [client],
  );

  /**
   * Send a magic link for passwordless authentication.
   * 
   * NOTE: Better Auth requires the 'magicLink' plugin on the server for
   * proper magic link functionality. This implementation uses the password
   * reset flow as a temporary fallback, which sends an email link to the user.
   * To enable true magic links, configure the magicLink plugin in the API's
   * Better Auth configuration.
   */
  const sendMagicLink = useCallback(
    async (email: string, redirectUrl: string): Promise<AuthResult> => {
      try {
        // Using forgetPassword as fallback - sends a link to the user's email
        // For proper magic link, configure magicLink plugin on the server
        const result = await client.forgetPassword({
          email,
          redirectTo: redirectUrl,
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
    [client],
  );

  /**
   * Send an OTP code via email for passwordless authentication.
   * 
   * NOTE: Better Auth requires the 'emailOtp' plugin on the server for
   * OTP functionality. This implementation uses the password reset flow
   * as a temporary fallback. To enable true email OTP, configure the
   * emailOtp plugin in the API's Better Auth configuration.
   */
  const sendOtpEmail = useCallback(
    async (email: string): Promise<AuthResult> => {
      try {
        // Using forgetPassword as fallback - sends a link to the user's email
        // For proper OTP, configure emailOtp plugin on the server
        const result = await client.forgetPassword({
          email,
          redirectTo: `${typeof globalThis !== 'undefined' && globalThis.location ? globalThis.location.origin : ''}/login/otp`,
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
    [client],
  );

  // Verify OTP - placeholder implementation
  const verifyOtp = useCallback(
    async (_email: string, _otp: string): Promise<AuthResult> => {
      try {
        // Email OTP verification requires emailOtp plugin
        return { 
          success: false, 
          error: {
            code: 'not_implemented',
            message: 'OTP verification requires emailOtp plugin configuration',
          }
        };
      } catch (error) {
        console.error('Error verifying OTP code', error);
        return handleAuthError(error);
      }
    },
    [],
  );

  const forgotPassword = useCallback(
    async (email: string, redirectUrl: string): Promise<AuthResult> => {
      try {
        const result = await client.forgetPassword({
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
    [client],
  );

  const resetPassword = useCallback(
    async (newPassword: string): Promise<AuthResult> => {
      try {
        const result = await client.resetPassword({
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
    [client],
  );

  const logout = useCallback(async (): Promise<AuthResult> => {
    try {
      await client.signOut();
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error during sign out', error);
      return handleAuthError(error);
    }
  }, [client]);

  const getSession = useCallback(async (): Promise<AuthSession | null> => {
    try {
      const result = await client.getSession();
      return convertSession(result.data);
    } catch (error) {
      console.error('Error getting session', error);
      return null;
    }
  }, [client, convertSession]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const sessionResult = await client.getSession();
      return sessionResult.data?.session?.token ?? null;
    } catch (error) {
      console.error('Error getting access token', error);
      return null;
    }
  }, [client]);

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
