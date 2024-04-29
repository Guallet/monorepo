import { Navigate, createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: () => Index(),
});

function Index() {
  return <Navigate to="/dashboard" replace={true} />;
}
