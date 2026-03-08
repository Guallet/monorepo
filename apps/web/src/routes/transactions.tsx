import { createFileRoute } from "@tanstack/react-router"

import { ProtectedShellPage } from "@/components/protected-shell-page"

export const Route = createFileRoute("/transactions")({
  component: TransactionsPage,
})

function TransactionsPage() {
  return (
    <ProtectedShellPage
      title="Transactions"
      description="All transactions will be listed here."
    />
  )
}
