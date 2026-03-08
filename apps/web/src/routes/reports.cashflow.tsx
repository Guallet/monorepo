import { createFileRoute } from "@tanstack/react-router"

import { ProtectedShellPage } from "@/components/protected-shell-page"

export const Route = createFileRoute("/reports/cashflow")({
  component: ReportsCashflowPage,
})

function ReportsCashflowPage() {
  return (
    <ProtectedShellPage
      title="Cashflow Report"
      description="Cashflow insights and breakdowns will be displayed here."
    />
  )
}
