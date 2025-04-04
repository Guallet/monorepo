// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/charts/styles.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from "./core/auth/useAuth";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GualletClientProvider } from "@guallet/api-react";
import { router, TanStackRouterDevtools } from "./router.tsx";
import { gualletClient } from "./core/api/gualletClient.ts";

// Init i18n
import "./i18n/i18n";

// Create a Query client
const queryClient = new QueryClient();

export default function App() {
  return (
    <MantineProvider>
      <Notifications />
      <AuthProvider>
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
    </MantineProvider>
  );
}
