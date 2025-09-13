import { CsvCategoriesScreen } from "@/features/importer/importers/csv/screens/CsvCategoriesScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/importer/csv/categories")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CsvCategoriesScreen />;
}
