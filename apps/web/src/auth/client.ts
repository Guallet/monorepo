import { createBetterAuthClient } from "@guallet/auth"

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000"

export const authClient = createBetterAuthClient({
  baseURL: API_BASE_URL,
  basePath: "/auth",
})