import { CsvPropertiesScreen } from "@/features/importer/importers/csv/screens/CsvPropertiesScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/importer/csv/properties")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CsvPropertiesScreen />;
}
