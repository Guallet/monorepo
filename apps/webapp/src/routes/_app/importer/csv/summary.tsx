import { CsvSummaryScreen } from "@/features/importer/importers/csv/screens/CsvSummaryScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/importer/csv/summary")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CsvSummaryScreen />;
}
