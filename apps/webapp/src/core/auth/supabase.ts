import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tmqyfmfilopdrhovpnrr.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcXlmbWZpbG9wZHJob3ZwbnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTExNTQ0NTYsImV4cCI6MjAwNjczMDQ1Nn0.clzAs88Sw_RfW4E24hfZUJKNaff15TXeVpYF8AfwO74";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
