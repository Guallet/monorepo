import { Session, User } from "@supabase/supabase-js";
import React, { useState, useEffect, useContext } from "react";
import { supabase } from "./supabaseClient";
import { Analytics } from "../analytics/Analytics";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<Error | null>;
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  session: null,
  loading: false,
  signOut: async () => {
    return null;
  },
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const init = async () => {
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();
    const { data: user, error: userError } = await supabase.auth.getUser();

    setSession(session.session);
    setUser(user.user);
    setLoading(false);
  };

  const setAnalyticsIdentity = (user: User | null) => {
    if (user) {
      Analytics.setIdentity(user.id, {
        email: user.email ?? "",
        name: user.user_metadata?.name ?? "",
        user_id: user.id,
      });
    } else {
      Analytics.resetIdentity();
    }
  };

  useEffect(() => {
    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setAnalyticsIdentity(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    return error;
  };

  const state = {
    user: user,
    session: session,
    loading: loading,
    signOut: logout,
  };

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
