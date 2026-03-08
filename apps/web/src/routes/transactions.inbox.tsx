import { createFileRoute } from "@tanstack/react-router"

import { ProtectedShellPage } from "@/components/protected-shell-page"
import { TransactionsInboxScreen } from "@/components/transactions-inbox-screen"

export const Route = createFileRoute("/transactions/inbox")({
  component: TransactionsInboxPage,
})

function TransactionsInboxPage() {
  return (
    <ProtectedShellPage
      title="Transactions Inbox"
      description="Review incoming activity and apply category decisions."
    >
      <TransactionsInboxScreen />
    </ProtectedShellPage>
  )
}
