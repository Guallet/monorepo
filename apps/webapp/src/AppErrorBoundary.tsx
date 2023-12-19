import { Stack } from "@mantine/core";
import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { AppRoutes } from "./router/AppRoutes";

export function AppErrorBoundary() {
  const error = useRouteError();

  console.error("Error loading the data for path", error);

  if (isRouteErrorResponse(error)) {
    return (
      <Stack>
        <h2>Error loading the route</h2>
        <h1>{error.status}</h1>
        <h3>{error.statusText}</h3>
        <h3>{error.data}</h3>
      </Stack>
    );
  }

  // rethrow to let the parent error boundary handle it
  // when it's not a special case for this route
  //   throw error;

  return (
    <div>
      {/* <h1>{error.status}</h1> */}
      <h2>Error loading the data</h2>
      <h3> {`${error}`}</h3>
      <p>Get in touch to help us improve the app</p>
      <Link to={AppRoutes.HOME}>Go back to the app</Link>
    </div>
  );
}
