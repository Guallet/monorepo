import { ConnectionDetailsScreen } from "@/features/connections/screens/ConnectionDetailsScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/connections/$id")({
  component: ConnectionDetailsPage,
});

function ConnectionDetailsPage() {
  const { id } = Route.useParams();
  return <ConnectionDetailsScreen connectionId={id} />;
}
