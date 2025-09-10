// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/charts/styles.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from "@/auth/useAuth.tsx";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GualletClientProvider } from "@guallet/api-react";
import { router, TanStackRouterDevtools } from "./router.tsx";
import { gualletClient } from "@/api/gualletClient.ts";
import { DatesProvider } from "@mantine/dates";

// Init i18n
import i18next from "./i18n/i18n";

// Vercel Analytics
import { Analytics } from "@vercel/analytics/react";

// Create a Query client
const queryClient = new QueryClient();

export default function App() {
  return (
    <MantineProvider>
      <DatesProvider
        settings={{
          locale: i18next.language,
        }}
      >
        <Notifications />
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <GualletClientProvider client={gualletClient}>
              <RouterProvider router={router} />
              {/* Tanstack Dev Tools */}
              <TanStackRouterDevtools router={router} />
              <ReactQueryDevtools initialIsOpen={false} />
              {/* END Tanstack Dev Tools */}
              <Analytics />
            </GualletClientProvider>
          </QueryClientProvider>
        </AuthProvider>
      </DatesProvider>
    </MantineProvider>
  );
}
