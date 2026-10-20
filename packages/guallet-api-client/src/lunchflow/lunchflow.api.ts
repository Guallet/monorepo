import { GualletClientImpl } from '../GualletClient';
import {
  ImportLunchFlowAccountsRequest,
  LunchFlowAccountsResponseDto,
  LunchFlowCredentialDto,
  LunchFlowImportResponseDto,
  LunchFlowSyncResponseDto,
  SaveLunchFlowCredentialRequest,
} from './lunchflow.models';

export class LunchFlowApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getCredential(): Promise<LunchFlowCredentialDto> {
    return await this.client.bankProviders.getCredentials('lunchflow');
  }

  async saveCredential(
    request: SaveLunchFlowCredentialRequest,
  ): Promise<LunchFlowCredentialDto> {
    return await this.client.bankProviders.saveCredentials(
      'lunchflow',
      request,
    );
  }

  async deleteCredential(): Promise<void> {
    return await this.client.bankProviders.deleteCredentials('lunchflow');
  }

  async getAccounts(): Promise<LunchFlowAccountsResponseDto> {
    return (await this.client.bankProviders.getAccounts(
      'lunchflow',
    )) as LunchFlowAccountsResponseDto;
  }

  async importAccounts(
    request: ImportLunchFlowAccountsRequest,
  ): Promise<LunchFlowImportResponseDto> {
    return await this.client.bankProviders.importAccounts('lunchflow', request);
  }

  async sync(): Promise<LunchFlowSyncResponseDto> {
    return await this.client.bankProviders.sync('lunchflow');
  }

  async unlinkAccount(accountId: string): Promise<void> {
    return await this.client.bankProviders.unlinkAccount(
      'lunchflow',
      accountId,
    );
  }
}
