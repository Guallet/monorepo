import { NotificationsScreen } from "@/features/notifications/screens/NotificationsScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/notifications/")({
  component: NotificationsPage,
});

function NotificationsPage() {
  return <NotificationsScreen />;
}
