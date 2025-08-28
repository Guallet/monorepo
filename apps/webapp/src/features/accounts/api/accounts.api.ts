import { get, patch, post } from "@/api/fetchHelper";
import { AccountDto } from "@guallet/api-client";

export async function loadAccounts(): Promise<AccountDto[]> {
  return await get<AccountDto[]>("accounts");
}

export async function getAccount(accountId: string): Promise<AccountDto> {
  return await get<AccountDto>(`accounts/${accountId}`);
}

export async function createAccount(account: CreateAccountRequest) {
  return await post<AccountDto, CreateAccountRequest>("accounts", account);
}

export async function updateAccount(
  accountId: string,
  account: UpdateAccountRequest
) {
  return await patch<AccountDto, UpdateAccountRequest>(
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
