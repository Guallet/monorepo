import { createFileRoute } from "@tanstack/react-router"

import { ProtectedShellPage } from "@/components/protected-shell-page"

export const Route = createFileRoute("/subscriptions")({
  component: SubscriptionsPage,
})

function SubscriptionsPage() {
  return (
    <ProtectedShellPage
      title="Subscriptions"
      description="Recurring subscription management will be shown here."
    />
  )
}
