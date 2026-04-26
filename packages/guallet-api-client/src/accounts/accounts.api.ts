import {
  AccountChartsDto,
  AccountDto,
  CreateAccountRequest,
  UpdateAccountRequest,
} from './accounts.models';
import { GualletClientImpl } from './../GualletClient';
import { TransactionDto } from './../transactions/transactions.models';
import { ObAccountDto } from './../connections';

const ACCOUNTS_PATH = 'accounts';

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
    account: UpdateAccountRequest,
  ): Promise<AccountDto> {
    return await this.client.patch<AccountDto, UpdateAccountRequest>({
      path: `${ACCOUNTS_PATH}/${accountId}`,
      payload: account,
    });
  }

  async delete(accountId: string): Promise<void> {
    return await this.client.fetch_delete({
      path: `${ACCOUNTS_PATH}/${accountId}`,
    });
  }

  async getAccountChartData(
    accountId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AccountChartsDto> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const basePath = `${ACCOUNTS_PATH}/${accountId}/charts`;
    const query = params.toString();
    const path = query ? `${basePath}?${query}` : basePath;

    return await this.client.get<AccountChartsDto>({
      path,
    });
  }

  // Gets the transactions for the account in the current month
  async getAccountTransactions(accountId: string): Promise<TransactionDto[]> {
    return await this.client.get<TransactionDto[]>({
      path: `${ACCOUNTS_PATH}/${accountId}/transactions`,
    });
  }

  async getConnectedAccount(accountId: string): Promise<ObAccountDto> {
    return await this.client.get<ObAccountDto>({
      path: `${ACCOUNTS_PATH}/${accountId}/connection`,
    });
  }
}
