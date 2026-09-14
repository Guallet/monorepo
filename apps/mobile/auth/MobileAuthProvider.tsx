import React, { useCallback } from 'react';
import { setAnalyticsDeviceId } from '@/utils/analytics';
import { AuthProvider as BaseAuthProvider } from '@guallet/auth';
import { authClient } from './auth';

interface MobileAuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: Readonly<MobileAuthProviderProps>) {
  const handleUserChange = useCallback(async (userId: string | null) => {
    await setAnalyticsDeviceId(userId);
  }, []);

  return (
    <BaseAuthProvider authClient={authClient} onUserChange={handleUserChange}>
      {children}
    </BaseAuthProvider>
  );
}
