import { Navigate, createFileRoute, Link } from "@tanstack/react-router"
import { useAuth } from "@guallet/auth"

import { Button } from "@/components/ui/button"

interface LoginCallbackSearch {
  error?: string
  error_code?: string
  error_description?: string
}

export const Route = createFileRoute("/login/callback")({
  validateSearch: (search): LoginCallbackSearch => ({
    error: typeof search.error === "string" ? search.error : undefined,
    error_code:
      typeof search.error_code === "string" ? search.error_code : undefined,
    error_description:
      typeof search.error_description === "string"
        ? search.error_description
        : undefined,
  }),
  component: LoginCallbackPage,
})

function LoginCallbackPage() {
  const { error, error_code, error_description } = Route.useSearch()
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="grid min-h-svh place-items-center bg-background px-6 py-10 text-foreground">
        <p className="text-sm text-muted-foreground">Finalizing login...</p>
      </div>
    )
  }

  if (error) {
    return (
      <main className="grid min-h-svh place-items-center bg-background px-6 py-10 text-foreground">
        <section className="w-full max-w-md rounded-2xl border border-destructive/40 bg-card p-6 shadow-xl">
          <h1 className="text-xl font-semibold">Authentication failed</h1>

          <div className="mt-4 grid gap-1 text-sm text-muted-foreground">
            <p>{error_code ?? error}</p>
            <p>{error_description?.replaceAll("+", " ") ?? "Unknown error."}</p>
          </div>

          <Button asChild className="mt-6 w-full">
            <Link to="/login">Back to login</Link>
          </Button>
        </section>
      </main>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Navigate to="/login" replace />
}