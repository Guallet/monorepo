import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import dns from "dns";

// To enable path alias
import { fileURLToPath, URL } from "node:url";

// Don't use 127.0.0.1, but "localhost".
// This is required for the supabase auth redirect allowed domains
dns.setDefaultResultOrder("verbatim");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite()],

  server: {
    port: 3000,
    strictPort: true,
    open: true,
  },

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@core": fileURLToPath(new URL("./src/core", import.meta.url)),
      "@components": fileURLToPath(
        new URL("./src/components", import.meta.url)
      ),
      "@router": fileURLToPath(new URL("./src/router", import.meta.url)),
      "@theme": fileURLToPath(new URL("./src/theme", import.meta.url)),
      "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),

      // Features
      "@accounts": fileURLToPath(
        new URL("./src/features/accounts", import.meta.url)
      ),
      "@auth": fileURLToPath(new URL("./src/features/auth", import.meta.url)),
      "@categories": fileURLToPath(
        new URL("./src/features/categories", import.meta.url)
      ),
      "@connections": fileURLToPath(
        new URL("./src/features/connections", import.meta.url)
      ),
      "@dashboard": fileURLToPath(
        new URL("./src/features/dashboard", import.meta.url)
      ),
      "@reports": fileURLToPath(
        new URL("./src/features/reports", import.meta.url)
      ),
      "@settings": fileURLToPath(
        new URL("./src/features/settings", import.meta.url)
      ),
      "@tools": fileURLToPath(new URL("./src/features/tools", import.meta.url)),
      "@transactions": fileURLToPath(
        new URL("./src/features/transactions", import.meta.url)
      ),
      "@user": fileURLToPath(new URL("./src/features/user", import.meta.url)),

      // "@guallet/ui-react": "/src/ui-react",
    },
  },
});
