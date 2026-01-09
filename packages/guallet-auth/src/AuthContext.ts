import { createContext } from 'react';

// Result types for better error handling
export type AuthResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: AuthError };

export interface AuthError {
  code: string;
  message: string;
}

// Base auth context type that both apps will use
export interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  session: any | null; // Session type from Supabase
}

// Extended auth context type with methods
export interface AuthContextWithMethods extends AuthContextType {
  login?: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  createAccount?: (args: {
    name: string;
    email: string;
    password: string;
  }) => Promise<AuthResult<{ userId: string }>>;
  loginWithProvider?: (provider: string) => Promise<AuthResult>;
  getOtpCode?: (email: string) => Promise<boolean>;
  signIn?: () => Promise<void>;
  signOut?: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextWithMethods>({
  isLoading: false,
  isAuthenticated: false,
  userId: null,
  session: null,
  logout: async () => {},
});
