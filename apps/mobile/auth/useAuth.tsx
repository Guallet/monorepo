import { Provider, Session } from "@supabase/supabase-js";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

interface AuthContextType {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  session?: Session | null;
  isLoading: boolean;

  getOtpCode: (email: string) => Promise<boolean>;
  loginWithProvider: (provider: Provider) => Promise<boolean>;
}

const AuthContext = React.createContext<AuthContextType>({
  signIn: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  session: null,
  isLoading: false,
  getOtpCode: (_email: string) => Promise.resolve(false),
  loginWithProvider: (_provider: Provider) => Promise.resolve(false),
});

// This hook can be used to access the user info.
export function useAuth() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useAuth must be wrapped in a <AuthProvider />");
    }
  }

  return value;
}

export function AuthProvider(props: Readonly<React.PropsWithChildren>) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
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

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const getOtpCodeFunction = useMemo(
    () => async (email: string) => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: "guallet://login/callback",
        },
      });
      if (error) {
        console.error("Error sending OTP", error);
        return false;
      }
      return true;
    },
    []
  );

  const loginWithProviderFunction = useMemo(
    () => async (provider: Provider) => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: "guallet://login/callback",
        },
      });
      if (error) {
        console.error("Error logging in with provider", error);
        return false;
      }

      return true;
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        signIn: async () => {
          // Perform sign-in logic here
          //   setSession("xxx");
        },
        signOut: async () => {
          await supabase.auth.signOut();
        },
        session,
        isLoading,
        getOtpCode: getOtpCodeFunction,
        loginWithProvider: loginWithProviderFunction,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
