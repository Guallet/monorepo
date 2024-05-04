import React, { useState, useContext, useEffect } from "react";

import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { User } from "@guallet/api-client";
import { gualletClient } from "@/App";

interface AuthContextType {
  user: User | null;
  session?: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: false,
  signOut: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  async function onSessionChanged(
    event: AuthChangeEvent,
    session: Session | null
  ) {
    setSession(session);

    if (session) {
      // await getUserProfile(session?.user?.id);
    } else {
      setUser(null);
    }
  }

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

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        onSessionChanged(event, session);
      }
    );

    return () => {
      authListener.subscription;
    };
  }, []);

  const getUserProfile = async (userId: string) => {
    if (userId) {
      const user = await gualletClient.user.getUserDetails();
      setUser(user);
    } else {
      setUser(null);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const state = {
    user: user,
    session: session,
    isLoading: isLoading,
    signOut: logout,
  };

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
