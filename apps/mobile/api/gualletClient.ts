import { supabase } from "@/auth/supabase";
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
  // baseUrl: "https://guallet.cjgaliana.com",
  // baseUrl: "https://guallet-dev.cjgaliana.com",
  baseUrl: "https://guallet-api-develop.fzx1cu.easypanel.host",
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
