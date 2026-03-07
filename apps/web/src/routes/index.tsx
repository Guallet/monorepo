import { Navigate, createFileRoute } from "@tanstack/react-router"
import { useAuth } from "@guallet/auth"

export const Route = createFileRoute("/")({
  component: IndexPage,
})

function IndexPage() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="grid min-h-svh place-items-center bg-background px-6 py-10 text-foreground">
        <p className="text-sm text-muted-foreground">Checking session...</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Navigate to="/login" replace />
}
