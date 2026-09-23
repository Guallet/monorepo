import React, { useCallback, useRef } from 'react';
import { setAnalyticsDeviceId } from '@/utils/analytics';
import { AuthProvider as BaseAuthProvider } from '@guallet/auth';
import { useQueryClient } from '@guallet/api-react';
import { authClient } from './auth';

interface MobileAuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: Readonly<MobileAuthProviderProps>) {
  const queryClient = useQueryClient();
  const previousUserId = useRef<string | null>(null);

  const handleUserChange = useCallback(
    async (userId: string | null) => {
      if (
        previousUserId.current !== null &&
        previousUserId.current !== userId
      ) {
        queryClient.clear();
      }

      previousUserId.current = userId;
      await setAnalyticsDeviceId(userId);
    },
    [queryClient],
  );

  return (
    <BaseAuthProvider authClient={authClient} onUserChange={handleUserChange}>
      {children}
    </BaseAuthProvider>
  );
}
