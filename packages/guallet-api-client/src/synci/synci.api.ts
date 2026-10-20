import { GualletClientImpl } from '../GualletClient';
import {
  ImportSynciAccountsRequest,
  SynciAccountsResponseDto,
  SynciCredentialDto,
  SynciImportResponseDto,
  SynciSyncResponseDto,
  SaveSynciCredentialRequest,
} from './synci.models';

export class SynciApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getCredential(): Promise<SynciCredentialDto> {
    return await this.client.bankProviders.getCredentials('synci');
  }

  async saveCredential(
    request: SaveSynciCredentialRequest,
  ): Promise<SynciCredentialDto> {
    return await this.client.bankProviders.saveCredentials('synci', request);
  }

  async deleteCredential(): Promise<void> {
    return await this.client.bankProviders.deleteCredentials('synci');
  }

  async getAccounts(): Promise<SynciAccountsResponseDto> {
    return (await this.client.bankProviders.getAccounts(
      'synci',
    )) as SynciAccountsResponseDto;
  }

  async importAccounts(
    request: ImportSynciAccountsRequest,
  ): Promise<SynciImportResponseDto> {
    return await this.client.bankProviders.importAccounts('synci', request);
  }

  async sync(): Promise<SynciSyncResponseDto> {
    return await this.client.bankProviders.sync('synci');
  }

  async unlinkAccount(accountId: string): Promise<void> {
    return await this.client.bankProviders.unlinkAccount('synci', accountId);
  }
}
