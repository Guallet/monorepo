import { createFileRoute } from "@tanstack/react-router"

import { ProtectedShellPage } from "@/components/protected-shell-page"

export const Route = createFileRoute("/accounts")({
  component: AccountsPage,
})

function AccountsPage() {
  return (
    <ProtectedShellPage
      title="Accounts"
      description="Account overview and balance summaries will live here."
    />
  )
}
