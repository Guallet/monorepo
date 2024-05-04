// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/charts/styles.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from "./core/auth/useAuth";
import { RouterProvider, Router, ErrorComponent } from "@tanstack/react-router";
import { NotFoundRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./routes/__root.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getCurrentUserToken } from "./core/auth/auth.helper.ts";
import { GualletClient } from "@guallet/api-client";
import { BuildConfig } from "./core/BuildConfig.ts";
import { GualletClientProvider } from "@guallet/api-react";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

const notFoundRoute = new NotFoundRoute({
  getParentRoute: () => rootRoute,
  component: () => "Use <PageNotFound/> instead",
});

// Create a new router instance
const router = new Router({
  routeTree,
  notFoundRoute,
  defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

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
