import { Center, Loader } from "@mantine/core";
import { RootRoute, Outlet } from "@tanstack/react-router";
import React, { Suspense } from "react";
// import { TanStackRouterDevtools } from "@tanstack/router-devtools";

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null // Render nothing in production
  : React.lazy(() =>
      // Lazy load in development
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
        // For Embedded Mode
        // default: res.TanStackRouterDevtoolsPanel,
      }))
    );

export const Route = new RootRoute({
  component: () => (
    <>
      <Outlet />
      <Suspense
        fallback={
          <Center>
            <Loader />
          </Center>
        }
      >
        <TanStackRouterDevtools />
      </Suspense>
    </>
  ),
});
