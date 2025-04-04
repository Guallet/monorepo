import { createContext } from "react";

type ExternalAuthProvider = "google";

export interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  createAccount: (args: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  loginWithProvider: (provider: ExternalAuthProvider) => Promise<void>;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export const AuthContext = createContext<AuthContextType>({
  isLoading: false,
  isAuthenticated: false,
  userId: null,
  login: async (_email: string, _password: string) => {},
  logout: async () => {},
  createAccount: async (_args: {
    name: string;
    email: string;
    password: string;
  }) => {},
  loginWithProvider: async (_provider: ExternalAuthProvider) => {},
});
