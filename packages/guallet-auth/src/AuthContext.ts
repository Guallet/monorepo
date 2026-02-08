import { createContext } from 'react';

export type ExternalAuthProvider = 'google' | 'github' | 'microsoft';

export type AuthResult = {
  success: boolean;
  error: AuthError | null;
};

export interface AuthError extends Omit<Error, 'name'> {
  code: string;
  message: string;
}

// Base auth context type that both apps will use
export interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
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
  getOtpCode: (email: string) => Promise<AuthResult>;
  verifyOtpCode: (email: string, code: string) => Promise<AuthResult>;
  resetPassword: (email: string, redirectUrl: string) => Promise<AuthResult>;
}

export const AuthContext = createContext<AuthContextWithMethods>({
  isLoading: true,
  isAuthenticated: false,
  userId: null,
  login: async (email: string, password: string): Promise<AuthResult> => {
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Function not implemented.' },
    };
  },
  logout: async (): Promise<AuthResult> => {
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Function not implemented.' },
    };
  },
  createAccount: async (args: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResult> => {
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Function not implemented.' },
    };
  },
  loginWithProvider: async (
    provider: ExternalAuthProvider,
    redirectUrl: string,
  ): Promise<AuthResult> => {
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Function not implemented.' },
    };
  },
  getOtpCode: async (email: string): Promise<AuthResult> => {
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Function not implemented.' },
    };
  },
  verifyOtpCode: async (email: string, code: string): Promise<AuthResult> => {
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Function not implemented.' },
    };
  },
  resetPassword: async (
    email: string,
    redirectUrl: string,
  ): Promise<AuthResult> => {
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Function not implemented.' },
    };
  },
});
