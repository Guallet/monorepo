import { DataImporterHomeScreen } from "@/features/importer/screens/DataImporterHomeScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/importer/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <DataImporterHomeScreen />;
}
