import GualletAppShell from "@/components/layout/GualletAppShell";
import { createFileRoute } from "@tanstack/react-router";
import { SessionAuth } from "supertokens-auth-react/recipe/session";

export const Route = createFileRoute("/_app")({
  component: ProtectedRoute,
});

function ProtectedRoute() {
  return (
    <SessionAuth>
      <GualletAppShell />
    </SessionAuth>
  );
}
