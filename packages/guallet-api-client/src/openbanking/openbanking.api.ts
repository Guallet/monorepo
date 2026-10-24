import { GualletClientImpl } from '../GualletClient';
import {
  AuthorizeBankRequest,
  BankAccountsDto,
  BankAuthorizationDto,
  BankConnectionDto,
  BankCredentials,
  BankInstitutionDto,
  BankJobAcceptedDto,
  BankJobOperation,
  BankJobStatusDto,
  BankProviderDto,
  CreateBankConnectionRequest,
} from './openbanking.models';
const OPENBANKING_PATH = 'openbanking';
export class OpenbankingApi {
  constructor(private readonly client: GualletClientImpl) {}
  getProviders(): Promise<BankProviderDto[]> {
    return this.client.get({ path: `${OPENBANKING_PATH}/providers` });
  }
  getConnections(): Promise<BankConnectionDto[]> {
    return this.client.get({ path: `${OPENBANKING_PATH}/connections` });
  }
  getConnection(id: string): Promise<BankConnectionDto> {
    return this.client.get({ path: this.path(id) });
  }
  createConnection(
    request: CreateBankConnectionRequest,
  ): Promise<BankConnectionDto> {
    return this.client.post({
      path: `${OPENBANKING_PATH}/connections`,
      payload: request,
    });
  }
  replaceCredentials(
    id: string,
    credentials: BankCredentials,
  ): Promise<BankConnectionDto> {
    return this.client.put({
      path: `${this.path(id)}/credentials`,
      payload: { credentials },
    });
  }
  deleteConnection(id: string): Promise<void> {
    return this.client.fetch_delete({ path: this.path(id) });
  }
  getAccounts(id: string): Promise<BankAccountsDto> {
    return this.client.get({ path: `${this.path(id)}/accounts` });
  }
  startOperation(
    id: string,
    operation: BankJobOperation,
    accountIds?: string[],
  ): Promise<BankJobAcceptedDto> {
    const suffix = operation === 'sync' ? 'sync' : `accounts/${operation}`;
    return this.client.post({
      path: `${this.path(id)}/${suffix}`,
      payload: operation === 'import' ? { accountIds } : {},
    });
  }
  getJob(
    id: string,
    jobId: string,
    signal?: AbortSignal,
  ): Promise<BankJobStatusDto> {
    return this.client.get({
      path: `${this.path(id)}/jobs/${encodeURIComponent(jobId)}`,
      options: { signal },
    });
  }
  unlinkAccount(id: string, accountId: string): Promise<void> {
    return this.client.fetch_delete({
      path: `${this.path(id)}/accounts/${encodeURIComponent(accountId)}/link`,
    });
  }
  getInstitutions(id: string, country: string): Promise<BankInstitutionDto[]> {
    return this.client.get({
      path: `${this.path(id)}/institutions?${new URLSearchParams({ country })}`,
    });
  }
  authorize(
    id: string,
    request: AuthorizeBankRequest,
  ): Promise<BankAuthorizationDto> {
    return this.client.post({
      path: `${this.path(id)}/authorizations`,
      payload: request,
    });
  }
  completeAuthorization(
    id: string,
    authorizationId: string,
  ): Promise<BankJobAcceptedDto> {
    return this.client.post({
      path: `${this.path(id)}/authorizations/${encodeURIComponent(authorizationId)}/complete`,
      payload: {},
    });
  }
  private path(id: string): string {
    return `${OPENBANKING_PATH}/connections/${encodeURIComponent(id)}`;
  }
}
