import { GualletClientImpl } from '../GualletClient';
import {
  BankProviderAccountsResponseDto,
  BankProviderCredentialDto,
  BankProviderId,
  BankProviderImportResponseDto,
  BankProviderJobAcceptedDto,
  BankProviderJobStatusDto,
  BankProviderSyncResponseDto,
  ImportBankProviderAccountsRequest,
  SaveBankProviderCredentialsRequest,
} from './bank-providers.models';

const BANK_PROVIDERS_PATH = 'bank-providers';

export class BankProvidersApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getCredentials(
    providerId: BankProviderId,
  ): Promise<BankProviderCredentialDto> {
    return await this.client.get<BankProviderCredentialDto>({
      path: `${this.providerPath(providerId)}/credentials`,
    });
  }

  async saveCredentials(
    providerId: BankProviderId,
    request: SaveBankProviderCredentialsRequest,
  ): Promise<BankProviderCredentialDto> {
    return await this.client.put<
      BankProviderCredentialDto,
      SaveBankProviderCredentialsRequest
    >({
      path: `${this.providerPath(providerId)}/credentials`,
      payload: request,
    });
  }

  async deleteCredentials(providerId: BankProviderId): Promise<void> {
    return await this.client.fetch_delete<void>({
      path: `${this.providerPath(providerId)}/credentials`,
    });
  }

  async getAccounts(
    providerId: BankProviderId,
  ): Promise<BankProviderAccountsResponseDto> {
    const response = await this.client.get<
      BankProviderAccountsResponseDto | BankProviderJobAcceptedDto
    >({ path: `${this.providerPath(providerId)}/accounts` });
    if ('jobId' in response) {
      return await this.waitForJob<BankProviderAccountsResponseDto>(
        providerId,
        response.jobId,
      );
    }
    return response;
  }

  async importAccounts(
    providerId: BankProviderId,
    request: ImportBankProviderAccountsRequest,
  ): Promise<BankProviderImportResponseDto> {
    const response = await this.client.post<
      BankProviderImportResponseDto | BankProviderJobAcceptedDto,
      ImportBankProviderAccountsRequest
    >({
      path: `${this.providerPath(providerId)}/accounts/import`,
      payload: request,
    });
    if ('jobId' in response) {
      return await this.waitForJob<BankProviderImportResponseDto>(
        providerId,
        response.jobId,
      );
    }
    return response;
  }

  async sync(providerId: BankProviderId): Promise<BankProviderSyncResponseDto> {
    const response = await this.client.post<
      BankProviderSyncResponseDto | BankProviderJobAcceptedDto,
      Record<string, never>
    >({ path: `${this.providerPath(providerId)}/sync`, payload: {} });
    if ('jobId' in response) {
      return await this.waitForJob<BankProviderSyncResponseDto>(
        providerId,
        response.jobId,
      );
    }
    return response;
  }

  async unlinkAccount(
    providerId: BankProviderId,
    accountId: string,
  ): Promise<void> {
    return await this.client.fetch_delete<void>({
      path: `${this.providerPath(providerId)}/accounts/${encodeURIComponent(accountId)}`,
    });
  }

  private providerPath(providerId: BankProviderId): string {
    return `${BANK_PROVIDERS_PATH}/${encodeURIComponent(providerId)}`;
  }

  private async waitForJob<T>(providerId: BankProviderId, jobId: string) {
    const path = `${this.providerPath(providerId)}/jobs/${encodeURIComponent(jobId)}`;
    for (let attempt = 0; attempt < 240; attempt += 1) {
      const job = await this.client.get<BankProviderJobStatusDto>({ path });
      if (job.status === 'failed') {
        throw new Error(job.error ?? `${providerId} job failed`);
      }
      if (job.status === 'completed') {
        if (job.result === null || job.result === undefined) {
          throw new Error(`${providerId} job did not return a result`);
        }
        return job.result as T;
      }
      await new Promise((resolve) => setTimeout(resolve, 5_000));
    }
    throw new Error(
      `${providerId} job is still running. Refresh to check again.`,
    );
  }
}
