import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/core/auth/supabaseClient";

export async function getCurrentUserToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();

  return data.session?.access_token ?? null;
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();

  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();

  return data.user;
}

export async function signOut() {
  return await supabase.auth.signOut();
}
