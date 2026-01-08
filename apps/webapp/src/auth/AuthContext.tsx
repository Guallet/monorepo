import { createContext } from 'react';

type ExternalAuthProvider = 'google';

// Result types for better error handling
export type AuthResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: AuthError };

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  createAccount: (args: {
    name: string;
    email: string;
    password: string;
  }) => Promise<AuthResult<{ userId: string }>>;
  loginWithProvider: (provider: ExternalAuthProvider) => Promise<AuthResult>;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export const AuthContext = createContext<AuthContextType>({
  isLoading: false,
  isAuthenticated: false,
  userId: null,
  login: async (_email: string, _password: string) => ({ success: true }),
  logout: async () => {},
  createAccount: async (_args: {
    name: string;
    email: string;
    password: string;
  }) => ({ success: true }),
  loginWithProvider: async (_provider: ExternalAuthProvider) => ({
    success: true,
  }),
});
