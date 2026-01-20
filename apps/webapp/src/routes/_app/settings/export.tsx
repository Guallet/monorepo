import { DataExportScreen } from "@/features/importer/screens/DataExportScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/settings/export")({
  component: RouteComponent,
});

function RouteComponent() {
  return <DataExportScreen />;
}
