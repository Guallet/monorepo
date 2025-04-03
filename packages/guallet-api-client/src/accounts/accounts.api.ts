import {
  AccountChartsDto,
  AccountDto,
  CreateAccountRequest,
  UpdateAccountRequest,
} from "./accounts.models";
import { GualletClient } from "./../GualletClient";
import { TransactionDto } from "./../transactions/transactions.models";

const ACCOUNTS_PATH = "accounts";

export class AccountsApi {
  constructor(private readonly client: GualletClient) {}

  async getAll(): Promise<AccountDto[]> {
    return await this.client.get<AccountDto[]>(ACCOUNTS_PATH);
  }

  async get(accountId: string): Promise<AccountDto> {
    return await this.client.get<AccountDto>(`${ACCOUNTS_PATH}/${accountId}`);
  }

  async create(account: CreateAccountRequest): Promise<AccountDto> {
    return await this.client.post<AccountDto, CreateAccountRequest>(
      ACCOUNTS_PATH,
      account
    );
  }

  async update(
    accountId: string,
    account: UpdateAccountRequest
  ): Promise<AccountDto> {
    return await this.client.patch<AccountDto, UpdateAccountRequest>(
      `${ACCOUNTS_PATH}/${accountId}`,
      account
    );
  }

  async getAccountChartData(accountId: string): Promise<AccountChartsDto> {
    return await this.client.get<AccountChartsDto>(
      `${ACCOUNTS_PATH}/${accountId}/charts`
    );
  }

  // Gets the transactions for the account in the current month
  async getAccountTransactions(accountId: string): Promise<TransactionDto[]> {
    return await this.client.get<TransactionDto[]>(
      `${ACCOUNTS_PATH}/${accountId}/transactions`
    );
  }
}
