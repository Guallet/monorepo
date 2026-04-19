// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/dropzone/styles.css';

import { GualletThemeProvider } from '@guallet/ui-react';
import { Notifications } from '@mantine/notifications';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GualletClientProvider } from '@guallet/api-react';
import { router, TanStackRouterDevtools } from './router.tsx';
import { gualletClient } from '@/api/gualletClient.ts';
import { DatesProvider } from '@mantine/dates';

import { authClient } from './auth/auth.ts';
import { AuthProvider } from '@guallet/auth';

// Init i18n
import i18next from './i18n/i18n';

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  browserQueryClient ??= new QueryClient();

  return browserQueryClient;
}

export default function App() {
  const queryClient = getQueryClient();

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
              <RouterProvider router={router} />
              {/* Tanstack Dev Tools */}
              <TanStackRouterDevtools router={router} />
              <ReactQueryDevtools initialIsOpen={false} />
              {/* END Tanstack Dev Tools */}
            </GualletClientProvider>
          </QueryClientProvider>
        </AuthProvider>
      </DatesProvider>
    </GualletThemeProvider>
  );
}
