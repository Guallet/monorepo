import { createFileRoute } from "@tanstack/react-router"

import { ProtectedShellPage } from "@/components/protected-shell-page"

export const Route = createFileRoute("/saving-goals")({
  component: SavingGoalsPage,
})

function SavingGoalsPage() {
  return (
    <ProtectedShellPage
      title="Saving Goals"
      description="Create and monitor saving goals from this page."
    />
  )
}
