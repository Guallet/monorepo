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
import { GualletClient } from "@guallet/api-client";
import { BuildConfig } from "./build.config.ts";
import { GualletClientProvider } from "@guallet/api-react";
import { initFontAwesome6 } from "./core/FontAwesome6.ts";
import { router } from "./router.tsx";
import { getCurrentUserToken } from "./core/auth/supabase.ts";

// Initialize FontAwesome6 for React
initFontAwesome6();

// Create a Query client
const queryClient = new QueryClient();

// eslint-disable-next-line react-refresh/only-export-components
export const gualletClient = GualletClient.createClient({
  baseUrl: BuildConfig.BASE_API_URL,
  getTokenFunction: getCurrentUserToken,
});

export default function App() {
  return (
    <MantineProvider>
      <Notifications />
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <GualletClientProvider client={gualletClient}>
            <RouterProvider router={router} />
            <ReactQueryDevtools initialIsOpen={false} />
          </GualletClientProvider>
        </QueryClientProvider>
      </AuthProvider>
    </MantineProvider>
  );
}
