import { createFileRoute } from "@tanstack/react-router"

import { ProtectedShellPage } from "@/components/protected-shell-page"

export const Route = createFileRoute("/transactions/inbox")({
  component: TransactionsInboxPage,
})

function TransactionsInboxPage() {
  return (
    <ProtectedShellPage
      title="Transactions Inbox"
      description="Review and categorize incoming transactions from here."
    />
  )
}
