import GualletAppShell from '@/components/Layout/GualletAppShell';
import { useAuth } from '@guallet/auth';
import { Navigate, createFileRoute, useRouter } from '@tanstack/react-router';

export const Route = createFileRoute('/_app')({
  component: ProtectedRoute,
});

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const { state } = useRouter();
  const resolvedLocation = state.resolvedLocation;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <output className="sr-only">Loading</output>
        <div
          aria-hidden="true"
          className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
        />
      </div>
    );
  } else {
    if (!isAuthenticated) {
      // Redirect them to the /login page, but save the current location they were
      // trying to go to when they were redirected. This allows us to send them
      // along to that page after they login, which is a nicer user experience
      // than dropping them off on the home page.
      console.log('User not authenticated. Redirecting to login page.', {
        redirectDestination: resolvedLocation?.pathname,
      });
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
