import { createFileRoute } from "@tanstack/react-router"

import { ProtectedShellPage } from "@/components/protected-shell-page"

export const Route = createFileRoute("/tools/loan")({
  component: ToolsLoanPage,
})

function ToolsLoanPage() {
  return (
    <ProtectedShellPage
      title="Loan Tools"
      description="Loan planning tools and calculators will be provided here."
    />
  )
}
