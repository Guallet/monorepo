import type { CSSProperties } from "react"
import { useState } from "react"
import { Navigate, createFileRoute, useNavigate } from "@tanstack/react-router"
import { useAuth } from "@guallet/auth"

import dashboardData from "@/app/dashboard/data.json"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex items-center justify-between px-4 lg:px-6">
                <div className="text-sm text-muted-foreground">
                  Signed in as{" "}
                  <span className="font-mono">{userId ?? "Unknown"}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </Button>
              </div>

              {error ? (
                <p className="mx-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive lg:mx-6">
                  {error}
                </p>
              ) : null}

              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={dashboardData} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
