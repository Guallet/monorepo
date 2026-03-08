import { createFileRoute } from "@tanstack/react-router"

import { ProtectedShellPage } from "@/components/protected-shell-page"

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
})

function ReportsPage() {
  return (
    <ProtectedShellPage
      title="Reports"
      description="Financial reporting entry points are available from here."
    />
  )
}
