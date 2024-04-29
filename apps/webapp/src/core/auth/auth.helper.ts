import { supabase } from "./supabase";

export async function getCurrentUserToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
