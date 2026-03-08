import { createFileRoute } from "@tanstack/react-router"

import { ProtectedShellPage } from "@/components/protected-shell-page"

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <ProtectedShellPage
      title="Settings"
      description="Application preferences and account settings belong here."
    />
  )
}
