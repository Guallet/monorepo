import { InstitutionsSettingsScreen } from "@/features/institutions/screens/InstitutionsSettingsScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/settings/institutions/")({
  component: InstitutionsPage,
});

function InstitutionsPage() {
  return <InstitutionsSettingsScreen />;
}
