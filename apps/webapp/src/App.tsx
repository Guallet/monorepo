import '@mantine/charts/styles.css';
import '@mantine/dropzone/styles.css';

import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GualletClientProvider } from '@guallet/api-react';
import { router, TanStackRouterDevtools } from './router.tsx';
import { gualletClient } from '@/api/gualletClient.ts';
import { Toaster } from 'sonner';
import './i18n/i18n';

import { authClient } from './auth/auth.ts';
import { AuthProvider } from '@guallet/auth';

// Create a Query client
const queryClient = new QueryClient();

export default function App() {
  return (
    <AuthProvider authClient={authClient}>
      <QueryClientProvider client={queryClient}>
        <GualletClientProvider client={gualletClient}>
          <RouterProvider router={router} />
          <Toaster richColors position="top-right" />
          {/* Tanstack Dev Tools */}
          <TanStackRouterDevtools router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
          {/* END Tanstack Dev Tools */}
        </GualletClientProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
