import GualletAppShell from "@/components/layout/GualletAppShell";
import { FileRoute } from "@tanstack/react-router";
import { SessionAuth } from "supertokens-auth-react/recipe/session";

export const Route = new FileRoute("/_app").createRoute({
  component: ProtectedRoute,
});

function ProtectedRoute() {
  return (
    <SessionAuth>
      <GualletAppShell />
    </SessionAuth>
  );
}
