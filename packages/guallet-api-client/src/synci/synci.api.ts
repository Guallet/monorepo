import { GualletClientImpl } from '../GualletClient';
import {
  ImportSynciAccountsRequest,
  SynciAccountsResponseDto,
  SynciCredentialDto,
  SynciImportResponseDto,
  SynciSyncResponseDto,
  SaveSynciCredentialRequest,
} from './synci.models';

const SYNCI_PATH = 'synci';

export class SynciApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getCredential(): Promise<SynciCredentialDto> {
    return await this.client.get<SynciCredentialDto>({
      path: `${SYNCI_PATH}/connection`,
    });
  }

  async saveCredential(
    request: SaveSynciCredentialRequest,
  ): Promise<SynciCredentialDto> {
    return await this.client.put<
      SynciCredentialDto,
      SaveSynciCredentialRequest
    >({
      path: `${SYNCI_PATH}/connection`,
      payload: request,
    });
  }

  async deleteCredential(): Promise<void> {
    return await this.client.fetch_delete<void>({
      path: `${SYNCI_PATH}/connection`,
    });
  }

  async getAccounts(): Promise<SynciAccountsResponseDto> {
    return await this.client.get<SynciAccountsResponseDto>({
      path: `${SYNCI_PATH}/accounts`,
    });
  }

  async importAccounts(
    request: ImportSynciAccountsRequest,
  ): Promise<SynciImportResponseDto> {
    return await this.client.post<
      SynciImportResponseDto,
      ImportSynciAccountsRequest
    >({
      path: `${SYNCI_PATH}/accounts/import`,
      payload: request,
    });
  }

  async sync(): Promise<SynciSyncResponseDto> {
    return await this.client.post<SynciSyncResponseDto, Record<string, never>>({
      path: `${SYNCI_PATH}/sync`,
      payload: {},
    });
  }

  async unlinkAccount(accountId: string): Promise<void> {
    return await this.client.fetch_delete<void>({
      path: `${SYNCI_PATH}/accounts/${encodeURIComponent(accountId)}`,
    });
  }
}
