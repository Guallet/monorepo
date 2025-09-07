import { ConnectionsScreen } from "@/features/connections/screens/ConnectionsScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/connections/")({
  component: ConnectionsPage,
});

function ConnectionsPage() {
  return <ConnectionsScreen />;
}
