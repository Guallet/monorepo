// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/charts/styles.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { SuperTokensWrapper } from "supertokens-auth-react";
import { initializePostHog } from "@core/analytics/posthog";
import { AuthProvider } from "./core/auth/useAuth";
import { RouterProvider, Router, ErrorComponent } from "@tanstack/react-router";
import { NotFoundRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./routes/__root.tsx";

import { initializeSupertokens } from "./core/auth/supertokens.ts";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

initializePostHog();
initializeSupertokens();

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

export default function App() {
  return (
    <SuperTokensWrapper>
      <MantineProvider>
        <Notifications />
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </MantineProvider>
    </SuperTokensWrapper>
  );
}
