import { DataExportScreen } from "@/features/importer/screens/DataExportScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/importer/export")({
  component: RouteComponent,
});

function RouteComponent() {
  return <DataExportScreen />;
}
