import { useAuth } from "@/core/auth/useAuth";
import { Center, Loader } from "@mantine/core";
import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login/callback")({
  component: LoginCallbackPage,
});

function LoginCallbackPage() {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (!session) {
    return <Navigate to="/login" search={{ redirect: "/dashboard" }} />;
  }

  return <Navigate to="/dashboard" />;
}
