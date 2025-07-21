import { createFileRoute } from "@tanstack/react-router";
import { AddAccountScreen } from "@/features/accounts/screens/AddAccountScreen";

export const Route = createFileRoute("/_app/accounts/new")({
  component: AddAccountPage,
});

export function AddAccountPage() {
  return <AddAccountScreen />;
}
