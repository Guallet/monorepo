import { SettingsScreen } from "@/features/settings/screens/SettingsScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  return <SettingsScreen />;
}
