import React, { useState, useContext, useEffect } from "react";
import { Analytics } from "@core/analytics/Analytics";
import { UserDto } from "@/features/user/api/user.api";
import { get } from "../api/fetchHelper";

import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface AuthContextType {
  user: UserDto | null;
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
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  async function onSessionChanged(session: Session | null) {
    setSession(session);

    if (session) {
      // await getUserProfile(session?.user?.id);
    } else {
      setUser(null);
      setAnalyticsIdentity(null);
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

    supabase.auth.onAuthStateChange(async (_event, session) => {
      await onSessionChanged(session);
    });
  }, []);

  const getUserProfile = async (userId: string) => {
    if (userId) {
      const user = await get<UserDto>(`users`);
      setUser(user);
      setAnalyticsIdentity(user);
    } else {
      setUser(null);
      setAnalyticsIdentity(null);
    }
  };

  const setAnalyticsIdentity = (user: UserDto | null) => {
    if (session && user) {
      Analytics.setIdentity(session.user.id, {
        email: user.email,
        name: user.name,
        user_id: session.user.id,
      });
    } else {
      Analytics.resetIdentity();
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAnalyticsIdentity(null);
  };

  const state = {
    user: user,
    session: session,
    isLoading: isLoading,
    signOut: logout,
  };

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
