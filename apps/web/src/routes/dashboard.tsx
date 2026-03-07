import { useState } from "react"
import { Navigate, createFileRoute, useNavigate } from "@tanstack/react-router"
import { useAuth } from "@guallet/auth"

import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate({ from: "/dashboard" })
  const { isLoading, isAuthenticated, userId, logout } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

  if (isLoading) {
    return (
      <div className="grid min-h-svh place-items-center bg-background px-6 py-10 text-foreground">
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const handleSignOut = async () => {
    setError(null)
    setIsSigningOut(true)

    const result = await logout()
    setIsSigningOut(false)

    if (!result.success) {
      setError(result.error?.message ?? "Unable to sign out.")
      return
    }

    navigate({ to: "/login" })
  }

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_100%_0%,hsl(179_56%_89%),transparent_45%),linear-gradient(155deg,hsl(0_0%_100%)_0%,hsl(194_41%_96%)_100%)] px-6 py-10 text-foreground sm:px-10">
      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-border/70 bg-card/90 p-8 shadow-2xl backdrop-blur sm:p-10">
        <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          You are signed in
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          Authentication is active with Better Auth. This is your protected
          landing page after OTP, magic-link, or Google login.
        </p>

        <dl className="mt-8 grid gap-4 rounded-2xl border border-border/70 bg-background/70 p-5 sm:grid-cols-2">
          <div className="space-y-1">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Session status
            </dt>
            <dd className="font-medium">Authenticated</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              User ID
            </dt>
            <dd className="truncate font-mono text-sm">{userId ?? "Unknown"}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button type="button" onClick={handleSignOut} disabled={isSigningOut}>
            {isSigningOut ? "Signing out..." : "Sign out"}
          </Button>
          <Button asChild type="button" variant="outline">
            <a href="https://www.better-auth.com/docs" target="_blank" rel="noreferrer">
              Better Auth docs
            </a>
          </Button>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </section>
    </main>
  )
}