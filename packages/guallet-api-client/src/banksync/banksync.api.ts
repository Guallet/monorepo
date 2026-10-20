import { GualletClientImpl } from '../GualletClient';
import {
  BankSyncAccountsResponseDto,
  BankSyncCredentialDto,
  BankSyncImportResponseDto,
  BankSyncSyncResponseDto,
  ImportBankSyncAccountsRequest,
  SaveBankSyncCredentialRequest,
} from './banksync.models';

export class BankSyncApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getCredential(): Promise<BankSyncCredentialDto> {
    return await this.client.bankProviders.getCredentials('banksync');
  }

  async saveCredential(
    request: SaveBankSyncCredentialRequest,
  ): Promise<BankSyncCredentialDto> {
    return await this.client.bankProviders.saveCredentials('banksync', request);
  }

  async deleteCredential(): Promise<void> {
    return await this.client.bankProviders.deleteCredentials('banksync');
  }

  async getAccounts(): Promise<BankSyncAccountsResponseDto> {
    return (await this.client.bankProviders.getAccounts(
      'banksync',
    )) as BankSyncAccountsResponseDto;
  }

  async importAccounts(
    request: ImportBankSyncAccountsRequest,
  ): Promise<BankSyncImportResponseDto> {
    return await this.client.bankProviders.importAccounts('banksync', request);
  }

  async sync(): Promise<BankSyncSyncResponseDto> {
    return await this.client.bankProviders.sync('banksync');
  }

  async unlinkAccount(accountId: string): Promise<void> {
    return await this.client.bankProviders.unlinkAccount('banksync', accountId);
  }
}
