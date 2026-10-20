import { GualletClientImpl } from '../GualletClient';
import {
  BankSyncAccountsResponseDto,
  BankSyncCredentialDto,
  BankSyncImportResponseDto,
  BankSyncJobAcceptedDto,
  BankSyncJobStatusDto,
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
    const job = await this.startJob('list');
    return await this.waitForJob<BankSyncAccountsResponseDto>(job.jobId);
  }

  async importAccounts(
    request: ImportBankSyncAccountsRequest,
  ): Promise<BankSyncImportResponseDto> {
    const job = await this.client.post<
      BankSyncJobAcceptedDto,
      ImportBankSyncAccountsRequest
    >({
      path: `${BANKSYNC_PATH}/accounts/import`,
      payload: request,
    });
    return await this.waitForJob<BankSyncImportResponseDto>(job.jobId);
  }

  async sync(): Promise<BankSyncSyncResponseDto> {
    const job = await this.client.post<
      BankSyncJobAcceptedDto,
      Record<string, never>
    >({
      path: `${BANKSYNC_PATH}/sync`,
      payload: {},
    });
    return await this.waitForJob<BankSyncSyncResponseDto>(job.jobId);
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

  private async startJob(operation: 'list'): Promise<BankSyncJobAcceptedDto> {
    return await this.client.post<
      BankSyncJobAcceptedDto,
      Record<string, never>
    >({
      path: `${BANKSYNC_PATH}/accounts/${operation}`,
      payload: {},
    });
  }

  private async waitForJob<T>(jobId: string): Promise<T> {
    for (let attempt = 0; attempt < 240; attempt += 1) {
      const job = await this.client.get<BankSyncJobStatusDto>({
        path: `${BANKSYNC_PATH}/jobs/${encodeURIComponent(jobId)}`,
      });
      if (job.status === 'failed') {
        throw new Error(job.error ?? 'BankSync job failed');
      }
      if (job.status === 'completed') {
        if (job.result === null || job.result === undefined) {
          throw new Error('BankSync job did not return a result');
        }
        return job.result as T;
      }
      await new Promise((resolve) => setTimeout(resolve, 5_000));
    }
    throw new Error('BankSync job is still running. Refresh to check again.');
  }
}
