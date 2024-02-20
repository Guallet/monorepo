import { Session } from "@supabase/supabase-js";
import React, { useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

const AuthContext = React.createContext<{
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  session?: Session | null;
  isLoading: boolean;
}>({
  signIn: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  session: null,
  isLoading: false,
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

export function AuthProvider(props: React.PropsWithChildren) {
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
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
