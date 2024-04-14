import { supabase } from "@/auth/supabase";
import { BuildConfig } from "@/buildConfig";
import { GualletClient } from "@guallet/api-client";

export const gualletClient = GualletClient.createClient({
  baseUrl: BuildConfig.BASE_API_URL,
  getTokenFunction: getCurrentUserToken,
});

async function getCurrentUserToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
