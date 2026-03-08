import { createClient } from "@guallet/api-client"

import { authClient } from "@/auth/client"

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000"

export const gualletClient = createClient({
  baseUrl: API_BASE_URL,
  tokenHelper: {
    getAccessToken: async () => {
      const { data } = await authClient.getSession()
      return data?.session?.id ?? null
    },
  },
})
