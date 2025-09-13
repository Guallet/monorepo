import { CsvAccountsScreen } from "@/features/importer/importers/csv/screens/CsvAccountsScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/importer/csv/accounts")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CsvAccountsScreen />;
}
