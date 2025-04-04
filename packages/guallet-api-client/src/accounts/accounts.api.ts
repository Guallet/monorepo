import {
  AccountChartsDto,
  AccountDto,
  CreateAccountRequest,
  UpdateAccountRequest,
} from "./accounts.models";
import { GualletClientImpl } from "./../GualletClient";
import { TransactionDto } from "./../transactions/transactions.models";

const ACCOUNTS_PATH = "accounts";

export class AccountsApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getAll(): Promise<AccountDto[]> {
    return await this.client.get<AccountDto[]>({
      path: ACCOUNTS_PATH,
    });
  }

  async get(accountId: string): Promise<AccountDto> {
    return await this.client.get<AccountDto>({
      path: `${ACCOUNTS_PATH}/${accountId}`,
    });
  }

  async create(account: CreateAccountRequest): Promise<AccountDto> {
    return await this.client.post<AccountDto, CreateAccountRequest>({
      path: ACCOUNTS_PATH,
      payload: account,
    });
  }

  async update(
    accountId: string,
    account: UpdateAccountRequest
  ): Promise<AccountDto> {
    return await this.client.patch<AccountDto, UpdateAccountRequest>({
      path: `${ACCOUNTS_PATH}/${accountId}`,
      payload: account,
    });
  }

  async getAccountChartData(accountId: string): Promise<AccountChartsDto> {
    return await this.client.get<AccountChartsDto>({
      path: `${ACCOUNTS_PATH}/${accountId}/charts`,
    });
  }

  // Gets the transactions for the account in the current month
  async getAccountTransactions(accountId: string): Promise<TransactionDto[]> {
    return await this.client.get<TransactionDto[]>({
      path: `${ACCOUNTS_PATH}/${accountId}/transactions`,
    });
  }
}
