import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "@tanstack/react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { GualletClientProvider } from "@guallet/api-react"
import { AuthProvider } from "@guallet/auth"

import "./index.css"
import { gualletClient } from "@/api/gualletClient.ts"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { TooltipProvider } from "@/components/ui/tooltip.tsx"
import { authClient } from "@/auth/client.ts"
import { router } from "./router.tsx"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider authClient={authClient}>
          <QueryClientProvider client={queryClient}>
            <GualletClientProvider client={gualletClient}>
              <RouterProvider router={router} />
            </GualletClientProvider>
          </QueryClientProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>
)
