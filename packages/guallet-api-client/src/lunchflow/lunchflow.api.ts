import { GualletClientImpl } from '../GualletClient';
import {
  ImportLunchFlowAccountsRequest,
  LunchFlowAccountsResponseDto,
  LunchFlowCredentialDto,
  LunchFlowImportResponseDto,
  LunchFlowSyncResponseDto,
  SaveLunchFlowCredentialRequest,
} from './lunchflow.models';

const LUNCHFLOW_PATH = 'lunchflow';

export class LunchFlowApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getCredential(): Promise<LunchFlowCredentialDto> {
    return await this.client.get<LunchFlowCredentialDto>({
      path: `${LUNCHFLOW_PATH}/connection`,
    });
  }

  async saveCredential(
    request: SaveLunchFlowCredentialRequest,
  ): Promise<LunchFlowCredentialDto> {
    return await this.client.put<
      LunchFlowCredentialDto,
      SaveLunchFlowCredentialRequest
    >({
      path: `${LUNCHFLOW_PATH}/connection`,
      payload: request,
    });
  }

  async deleteCredential(): Promise<void> {
    return await this.client.fetch_delete<void>({
      path: `${LUNCHFLOW_PATH}/connection`,
    });
  }

  async getAccounts(): Promise<LunchFlowAccountsResponseDto> {
    return await this.client.get<LunchFlowAccountsResponseDto>({
      path: `${LUNCHFLOW_PATH}/accounts`,
    });
  }

  async importAccounts(
    request: ImportLunchFlowAccountsRequest,
  ): Promise<LunchFlowImportResponseDto> {
    return await this.client.post<
      LunchFlowImportResponseDto,
      ImportLunchFlowAccountsRequest
    >({
      path: `${LUNCHFLOW_PATH}/accounts/import`,
      payload: request,
    });
  }

  async sync(): Promise<LunchFlowSyncResponseDto> {
    return await this.client.post<
      LunchFlowSyncResponseDto,
      Record<string, never>
    >({
      path: `${LUNCHFLOW_PATH}/sync`,
      payload: {},
    });
  }

  async unlinkAccount(accountId: string): Promise<void> {
    return await this.client.fetch_delete<void>({
      path: `${LUNCHFLOW_PATH}/accounts/${encodeURIComponent(accountId)}`,
    });
  }
}
