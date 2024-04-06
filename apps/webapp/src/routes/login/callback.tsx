import { useAuth } from "@/core/auth/useAuth";
import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login/callback")({
  component: LoginCallbackPage,
});

function LoginCallbackPage() {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" search={{ redirect: "/dashboard" }} />;
  }

  return <Navigate to="/dashboard" />;
}
