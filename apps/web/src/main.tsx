import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "@tanstack/react-router"
import { AuthProvider } from "@guallet/auth"

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { authClient } from "@/auth/client.ts"
import { router } from "./router.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider authClient={authClient}>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
)
