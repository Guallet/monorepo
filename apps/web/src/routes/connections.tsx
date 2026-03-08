import { createFileRoute } from "@tanstack/react-router"

import { ProtectedShellPage } from "@/components/protected-shell-page"

export const Route = createFileRoute("/connections")({
  component: ConnectionsPage,
})

function ConnectionsPage() {
  return (
    <ProtectedShellPage
      title="Connections"
      description="Bank and financial provider connections will be managed here."
    />
  )
}
