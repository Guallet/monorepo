import { createClient } from "@supabase/supabase-js";
import { BuildConfig } from "@/build.config";

const supabaseUrl = BuildConfig.AUTH.SUPABASE.URL;
const supabaseAnonKey = BuildConfig.AUTH.SUPABASE.KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
