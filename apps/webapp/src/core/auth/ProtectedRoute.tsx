import { Center, Loader } from "@mantine/core";
import { useLocation, Navigate } from "react-router-dom";
import { AppRoutes } from "@/router/AppRoutes";
import { useAuth } from "./useAuth";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { session, loading } = useAuth();

  const location = useLocation();

  if (loading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  } else {
    if (!session) {
      // Redirect them to the /login page, but save the current location they were
      // trying to go to when they were redirected. This allows us to send them
      // along to that page after they login, which is a nicer user experience
      // than dropping them off on the home page.
      return <Navigate to={AppRoutes.Auth.LOGIN} state={{ from: location }} />;
    }

    return children;
  }
}
