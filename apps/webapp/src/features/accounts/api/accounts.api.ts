import { get, patch, post } from "@/api/fetchHelper";
import { Account } from "../models/Account";

export async function loadAccounts(): Promise<Account[]> {
  return await get<Account[]>("accounts");
}

export async function getAccount(accountId: string): Promise<Account> {
  return await get<Account>(`accounts/${accountId}`);
}

export async function createAccount(account: CreateAccountRequest) {
  return await post<Account, CreateAccountRequest>("accounts", account);
}

export async function updateAccount(
  accountId: string,
  account: UpdateAccountRequest
) {
  return await patch<Account, UpdateAccountRequest>(
    `accounts/${accountId}`,
    account
  );
}

export type CreateAccountRequest = {
  name: string;
  type: string;
  currency: string;
  initial_balance?: number;
  institution_id?: string;
};

export type UpdateAccountRequest = {
  name?: string;
  type?: string;
  currency?: string;
  initial_balance?: number;
  institution_id?: string;
};
