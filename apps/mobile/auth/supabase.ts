import { AppState } from "react-native";
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { LargeSecureStore } from "./LargeSecureStore";

const supabaseUrl = "https://tmqyfmfilopdrhovpnrr.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcXlmbWZpbG9wZHJob3ZwbnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTExNTQ0NTYsImV4cCI6MjAwNjczMDQ1Nn0.clzAs88Sw_RfW4E24hfZUJKNaff15TXeVpYF8AfwO74";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: new LargeSecureStore(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
