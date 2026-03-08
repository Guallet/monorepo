import { createFileRoute } from "@tanstack/react-router"

import { ProtectedShellPage } from "@/components/protected-shell-page"

export const Route = createFileRoute("/categories/rules")({
  component: CategoryRulesPage,
})

function CategoryRulesPage() {
  return (
    <ProtectedShellPage
      title="Category Rules"
      description="Automation rules for categorization will be configured here."
    />
  )
}
