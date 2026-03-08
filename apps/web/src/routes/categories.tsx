import { createFileRoute } from "@tanstack/react-router"

import { ProtectedShellPage } from "@/components/protected-shell-page"

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
})

function CategoriesPage() {
  return (
    <ProtectedShellPage
      title="Categories"
      description="Manage your transaction categories here."
    />
  )
}
