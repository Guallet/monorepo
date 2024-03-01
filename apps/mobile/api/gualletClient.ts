import { supabase } from "@/auth/supabase";
import { GualletClient } from "@guallet/api-client";

export const gualletClient = GualletClient.createClient({
  baseUrl: "https://guallet-api.fzx1cu.easypanel.host",
  getTokenFunction: getCurrentUserToken,
});

async function getCurrentUserToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
