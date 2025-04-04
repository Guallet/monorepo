import { useAuth } from "@/auth/useAuth";
import { Center, Loader } from "@mantine/core";
import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login/callback")({
  component: LoginCallbackPage,
});

function LoginCallbackPage() {
  const { isLoading, session } = useAuth();

  // Read the destination redirection from the localstorage
  const redirectTo = localStorage.getItem("redirectDestination") ?? "dashboard";

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (!session) {
    return <Navigate to="/login" search={{ redirect: `${redirectTo}` }} />;
  }

  return <Navigate from="/" to={redirectTo} />;
}
