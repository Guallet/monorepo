import { DashboardScreen } from "@/features/dashboard/screen/DashboardScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard/")({
  component: DashboardPage,
});

export function DashboardPage() {
  return <DashboardScreen />;
}
