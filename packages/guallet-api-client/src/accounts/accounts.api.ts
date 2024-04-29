import {
  AccountDto,
  CreateAccountRequest,
  UpdateAccountRequest,
} from "./accounts.models";
import { GualletClient } from "./../GualletClient";

const ACCOUNTS_PATH = "accounts";

export class AccountsApi {
  constructor(private client: GualletClient) {}

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
}
