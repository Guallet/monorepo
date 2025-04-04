import GualletAppShell from "@/components/Layout/GualletAppShell";
import { useAuth } from "@/auth/useAuth";
import { Center, Loader } from "@mantine/core";
import { Navigate, createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  component: ProtectedRoute,
});

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const { state } = useRouter();
  const resolvedLocation = state.resolvedLocation;

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  } else {
    if (!isAuthenticated) {
      // Redirect them to the /login page, but save the current location they were
      // trying to go to when they were redirected. This allows us to send them
      // along to that page after they login, which is a nicer user experience
      // than dropping them off on the home page.
      return (
        <Navigate
          to="/login"
          search={{ redirect: resolvedLocation?.pathname }}
        />
      );
    }

    return <GualletAppShell />;
  }
}
