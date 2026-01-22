import { createContext } from 'react';

export type ExternalAuthProvider = 'google' | 'github' | 'microsoft' | 'apple';

export type AuthResult = {
  success: boolean;
  error: AuthError | null;
};

export interface AuthError extends Omit<Error, 'name'> {
  code: string;
  message: string;
}

// User info from auth provider
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified?: boolean;
}

// Session info
export interface AuthSession {
  token: string;
  expiresAt: Date;
  user: AuthUser;
}

// Base auth context type that both apps will use
export interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  user: AuthUser | null;
  session: AuthSession | null;
}

// Extended auth context type with methods
export interface AuthContextWithMethods extends AuthContextType {
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<AuthResult>;
  createAccount: (args: {
    name: string;
    email: string;
    password: string;
  }) => Promise<AuthResult>;
  loginWithProvider: (
    provider: ExternalAuthProvider,
    redirectUrl: string,
  ) => Promise<AuthResult>;
  sendMagicLink: (email: string, redirectUrl: string) => Promise<AuthResult>;
  sendOtpEmail: (email: string) => Promise<AuthResult>;
  verifyOtp: (email: string, code: string) => Promise<AuthResult>;
  forgotPassword: (email: string, redirectUrl: string) => Promise<AuthResult>;
  resetPassword: (newPassword: string) => Promise<AuthResult>;
  getSession: () => Promise<AuthSession | null>;
  getAccessToken: () => Promise<string | null>;
}

const notImplementedResult = async (): Promise<AuthResult> => ({
  success: false,
  error: { code: 'NOT_IMPLEMENTED', message: 'Function not implemented.' },
});

export const AuthContext = createContext<AuthContextWithMethods>({
  isLoading: true,
  isAuthenticated: false,
  userId: null,
  user: null,
  session: null,
  login: notImplementedResult,
  logout: notImplementedResult,
  createAccount: notImplementedResult,
  loginWithProvider: notImplementedResult,
  sendMagicLink: notImplementedResult,
  sendOtpEmail: notImplementedResult,
  verifyOtp: notImplementedResult,
  forgotPassword: notImplementedResult,
  resetPassword: notImplementedResult,
  getSession: async () => null,
  getAccessToken: async () => null,
});
