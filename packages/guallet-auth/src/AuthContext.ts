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
  /**
   * Request a password reset email to be sent to the user.
   * This initiates the "forgot password" flow.
   */
  resetPassword: (email: string, redirectUrl: string) => Promise<AuthResult>;
  /**
   * Submit a new password using the token from the reset email.
   * This completes the "reset password" flow.
   */
  confirmPasswordReset: (
    newPassword: string,
    token: string,
  ) => Promise<AuthResult>;
}

export const AuthContext = createContext<AuthContextWithMethods>({
  isLoading: true,
  isAuthenticated: false,
  userId: null,
  login: async (_email: string, _password: string): Promise<AuthResult> => {
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
  createAccount: async (_args: {
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
    _provider: ExternalAuthProvider,
    _redirectUrl: string,
  ): Promise<AuthResult> => {
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Function not implemented.' },
    };
  },
  getOtpCode: async (_email: string): Promise<AuthResult> => {
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Function not implemented.' },
    };
  },
  verifyOtpCode: async (_email: string, _code: string): Promise<AuthResult> => {
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Function not implemented.' },
    };
  },
  resetPassword: async (
    _email: string,
    _redirectUrl: string,
  ): Promise<AuthResult> => {
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Function not implemented.' },
    };
  },
  confirmPasswordReset: async (
    _newPassword: string,
    _token: string,
  ): Promise<AuthResult> => {
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Function not implemented.' },
    };
  },
});
