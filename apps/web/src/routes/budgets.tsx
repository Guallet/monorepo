import { createFileRoute } from "@tanstack/react-router"

import { ProtectedShellPage } from "@/components/protected-shell-page"

export const Route = createFileRoute("/budgets")({
  component: BudgetsPage,
})

function BudgetsPage() {
  return (
    <ProtectedShellPage
      title="Budgets"
      description="Budget planning and tracking will be available here."
    />
  )
}
