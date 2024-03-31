import { supabase } from "@/auth/supabase";
import { BuildConfig } from "@/buildConfig";
import {
  AccountsApi,
  BudgetsApi,
  CategoriesApi,
  ConnectionsApi,
  GualletClient,
  InstitutionsApi,
  TransactionsApi,
} from "@guallet/api-client";

const innerClient = GualletClient.createClient({
  baseUrl: BuildConfig.BASE_API_URL,
  getTokenFunction: getCurrentUserToken,
});

async function getCurrentUserToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

// TODO: This should be part of the client itself
// something like "gualletClient.accounts.getAll()"
export const gualletClient = {
  accounts: new AccountsApi(innerClient),
  categories: new CategoriesApi(innerClient),
  connections: new ConnectionsApi(innerClient),
  institutions: new InstitutionsApi(innerClient),
  transactions: new TransactionsApi(innerClient),
  budgets: new BudgetsApi(innerClient),
};
