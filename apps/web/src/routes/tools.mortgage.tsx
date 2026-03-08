import { createFileRoute } from "@tanstack/react-router"

import { ProtectedShellPage } from "@/components/protected-shell-page"

export const Route = createFileRoute("/tools/mortgage")({
  component: ToolsMortgagePage,
})

function ToolsMortgagePage() {
  return (
    <ProtectedShellPage
      title="Mortgage Tools"
      description="Mortgage estimations and scenarios will be available here."
    />
  )
}
