import { GualletThemeProvider } from '@guallet/ui-react';
import { Notifications } from '@mantine/notifications';
import { useRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GualletClientProvider } from '@guallet/api-react';
import { TanStackRouterDevtools } from '@/components/TanStackRouterDevtools';
import { gualletClient } from '@/api/gualletClient.ts';
import { initSentry } from '@/utils/sentry';
import { DatesProvider } from '@mantine/dates';
import { useEffect, useState, type ReactNode } from 'react';

import { authClient } from './auth/auth.ts';
import { AuthProvider } from '@guallet/auth';

// Init i18n
import i18next from './i18n/i18n';

export default function App({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    initSentry(router);
  }, [router]);

  return (
    <GualletThemeProvider>
      <DatesProvider
        settings={{
          locale: i18next.language,
        }}
      >
        <Notifications />
        <AuthProvider authClient={authClient}>
          <QueryClientProvider client={queryClient}>
            <GualletClientProvider client={gualletClient}>
              {children}
              {/* Tanstack Dev Tools */}
              <TanStackRouterDevtools />
              <ReactQueryDevtools initialIsOpen={false} />
              {/* END Tanstack Dev Tools */}
            </GualletClientProvider>
          </QueryClientProvider>
        </AuthProvider>
      </DatesProvider>
    </GualletThemeProvider>
  );
}
