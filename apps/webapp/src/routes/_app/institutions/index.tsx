import { InstitutionsScreen } from "@/features/institutions/screens/InstitutionsScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/institutions/")({
  component: InstitutionsPage,
});

function InstitutionsPage() {
  return <InstitutionsScreen />;
}
