import React, { useState, useContext, useEffect } from "react";

import { AuthChangeEvent, Provider, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { AuthContext, AuthContextType } from "@/auth/AuthContext";

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: React.ReactNode;
}
export function AuthProvider({ children }: Readonly<AuthProviderProps>) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function onSessionChanged(
    _event: AuthChangeEvent,
    session: Session | null
  ) {
    setSession(session);
    setIsAuthenticated(session !== null);
  }

  useEffect(() => {
    console.log("Initializing auth");
    setIsLoading(true);
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .catch((error) => {
        setSession(null);
        console.error("Error loading the session", error);
      })
      .finally(() => {
        setIsLoading(false);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        onSessionChanged(event, session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("Error logging in", error);
      throw error;
    }
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const createAccount = async ({
    name,
    email,
    password,
  }: {
    email: string;
    password: string;
    name: string;
  }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error) {
      console.error("Error creating account", error);
      throw error;
    }
  };

  const loginWithProvider = async (provider: string) => {
    let supabaseProvider: Provider | null = null;
    switch (provider) {
      case "google":
        supabaseProvider = "google";
        break;
      case "github":
        supabaseProvider = "github";
        break;
      case "microsoft":
        supabaseProvider = "azure";
        break;
      default:
        console.error("Unsupported provider");
        throw new Error("Unsupported provider");
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: supabaseProvider,
      options: {
        redirectTo: `${window.location.origin}/login/callback`,
      },
    });
    if (error) {
      console.error("Error logging in with provider", error);
      throw error;
    }
  };

  const state: AuthContextType = {
    isLoading: isLoading,
    isAuthenticated: isAuthenticated,
    userId: session?.user?.id ?? null,
    login: login,
    logout: logout,
    createAccount: createAccount,
    loginWithProvider: loginWithProvider,
  };

  const memoizedState = React.useMemo(
    () => state,
    [
      isLoading,
      isAuthenticated,
      session?.user?.id,
      login,
      logout,
      createAccount,
      loginWithProvider,
    ]
  );

  return (
    <AuthContext.Provider value={memoizedState}>
      {children}
    </AuthContext.Provider>
  );
}
