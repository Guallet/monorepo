import { CsvImporterScreen } from "@/features/importer/importers/csv/screens/CsvImporterScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/importer/csv/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CsvImporterScreen />;
}
