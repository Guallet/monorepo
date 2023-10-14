import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import dns from "dns";

// Don't use 127.0.0.1, but "localhost".
// This is required for the supabase auth redirect allowed domains
dns.setDefaultResultOrder("verbatim");

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
    open: true,
  },
  plugins: [react()],
});
