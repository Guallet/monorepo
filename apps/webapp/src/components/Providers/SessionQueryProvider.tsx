import { useState, type ReactNode } from 'react';
import { useAuth } from '@guallet/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface Props {
  children: ReactNode;
}

function QuerySession({ children }: Readonly<Props>) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export function SessionQueryProvider({ children }: Readonly<Props>) {
  const { userId } = useAuth();

  // Remount the query cache when the authenticated user changes.
  const sessionKey = userId ? `user:${userId}` : 'signed-out';
  return <QuerySession key={sessionKey}>{children}</QuerySession>;
}
