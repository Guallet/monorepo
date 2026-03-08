import { createFileRoute } from "@tanstack/react-router"

import { ProtectedShellPage } from "@/components/protected-shell-page"
import { TransactionsScreen } from "@/components/transactions-screen"

export const Route = createFileRoute("/transactions")({
  component: TransactionsPage,
})

function TransactionsPage() {
  return (
    <ProtectedShellPage
      title="Transactions"
      description="Review account activity, track cash flow, and keep transactions clean."
    >
      <TransactionsScreen />
    </ProtectedShellPage>
  )
}
