import { GualletClientImpl } from '../GualletClient';
import {
  BankSyncAccountsResponseDto,
  BankSyncCredentialDto,
  BankSyncImportResponseDto,
  BankSyncSyncResponseDto,
  ImportBankSyncAccountsRequest,
  SaveBankSyncCredentialRequest,
} from './banksync.models';

const BANKSYNC_PATH = 'banksync';

export class BankSyncApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getCredential(): Promise<BankSyncCredentialDto> {
    return await this.client.get<BankSyncCredentialDto>({
      path: `${BANKSYNC_PATH}/connection`,
    });
  }

  async saveCredential(
    request: SaveBankSyncCredentialRequest,
  ): Promise<BankSyncCredentialDto> {
    return await this.client.put<
      BankSyncCredentialDto,
      SaveBankSyncCredentialRequest
    >({
      path: `${BANKSYNC_PATH}/connection`,
      payload: request,
    });
  }

  async deleteCredential(): Promise<void> {
    return await this.client.fetch_delete<void>({
      path: `${BANKSYNC_PATH}/connection`,
    });
  }

  async getAccounts(): Promise<BankSyncAccountsResponseDto> {
    return await this.client.get<BankSyncAccountsResponseDto>({
      path: `${BANKSYNC_PATH}/accounts`,
    });
  }

  async importAccounts(
    request: ImportBankSyncAccountsRequest,
  ): Promise<BankSyncImportResponseDto> {
    return await this.client.post<
      BankSyncImportResponseDto,
      ImportBankSyncAccountsRequest
    >({
      path: `${BANKSYNC_PATH}/accounts/import`,
      payload: request,
    });
  }

  async sync(): Promise<BankSyncSyncResponseDto> {
    return await this.client.post<
      BankSyncSyncResponseDto,
      Record<string, never>
    >({
      path: `${BANKSYNC_PATH}/sync`,
      payload: {},
    });
  }

  async unlinkAccount(account: {
    bankId: string;
    accountId: string;
  }): Promise<void> {
    return await this.client.fetch_delete<void>({
      path: `${BANKSYNC_PATH}/accounts`,
      options: { body: JSON.stringify(account) },
    });
  }
}
