import { get } from "../../../core/api/fetchHelper";
import { Account } from "../models/Account";

export async function loadAccounts(): Promise<Account[]> {
  return await get<Account[]>("accounts");
}
