import React, { useState, useContext, useEffect, useMemo, useCallback } from 'react';
import type { SupabaseClient, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { AuthContext } from './AuthContext';

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: React.ReactNode;
  supabaseClient: SupabaseClient;
  onSessionChange?: (session: Session | null) => void;
}

export function AuthProvider({
  children,
  supabaseClient,
  onSessionChange,
}: Readonly<AuthProviderProps>) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function onSessionChanged(
    _event: AuthChangeEvent,
    session: Session | null,
  ) {
    setSession(session);
    setIsAuthenticated(session !== null);
    if (onSessionChange) {
      onSessionChange(session);
    }
  }

  useEffect(() => {
    setIsLoading(true);
    supabaseClient.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setIsAuthenticated(session !== null);
      })
      .catch((error) => {
        setSession(null);
        setIsAuthenticated(false);
        console.error('Error loading the session', error);
      })
      .finally(() => {
        setIsLoading(false);
      });

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        onSessionChanged(event, session);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabaseClient, onSessionChange]);

  const logout = useCallback(async () => {
    await supabaseClient.auth.signOut();
  }, [supabaseClient]);

  const memoizedState = useMemo(
    () => ({
      isLoading: isLoading,
      isAuthenticated: isAuthenticated,
      userId: session?.user?.id ?? null,
      session: session,
      logout: logout,
    }),
    [isLoading, isAuthenticated, session?.user?.id, session, logout],
  );

  return (
    <AuthContext.Provider value={memoizedState}>
      {children}
    </AuthContext.Provider>
  );
}
