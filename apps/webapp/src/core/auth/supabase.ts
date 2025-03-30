import { createClient } from "@supabase/supabase-js";
import { BuildConfig } from "@/build.config";

const supabaseUrl = BuildConfig.AUTH.SUPABASE.URL;
const supabaseAnonKey = BuildConfig.AUTH.SUPABASE.KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getCurrentUserToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
