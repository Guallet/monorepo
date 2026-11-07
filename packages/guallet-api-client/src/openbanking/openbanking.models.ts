export type BankProviderId = 'lunchflow' | 'banksync' | 'synci' | 'nordigen';
export type BankCredentials = {
  apiKey?: string;
  secretId?: string;
  secretKey?: string;
};
export type BankProviderDto = {
  id: BankProviderId;
  name: string;
  credentialFields: { name: keyof BankCredentials; secret: boolean }[];
  supportsBankAuthorization: boolean;
  authorizationCountries?: string[];
};
export type BankConnectionDto = {
  id: string;
  providerId: BankProviderId;
  status: 'configured';
  credentialHint: string | null;
  accountsRefreshedAt: string | null;
  lastSyncedAt: string | null;
};
export type CreateBankConnectionRequest = {
  providerId: BankProviderId;
  credentials: BankCredentials;
};
export type BankAccountDto = {
  id: string;
  name: string;
  institutionName: string | null;
  institutionLogo?: string | null;
  currency: string | null;
  balance?: string | null;
  status?: string;
  linkedAccountId: string | null;
};
export type BankAccountsDto = {
  accounts: BankAccountDto[];
  refreshedAt: string | null;
};
export type BankJobOperation = 'refresh' | 'import' | 'sync';
export type BankJobAcceptedDto = { jobId: string };
export type BankJobResultDto = {
  accountsDiscovered?: number;
  accountIds?: string[];
  accountsSynced?: number;
  errors?: string[];
};
export type BankJobStatusDto = {
  status: 'queued' | 'running' | 'completed' | 'failed';
  operation: BankJobOperation;
  result?: BankJobResultDto;
  error?: string;
};
export type BankInstitutionDto = {
  id: string;
  name: string;
  logo: string | null;
};
export type BankAuthorizationDto = {
  id: string;
  action: 'redirect';
  redirectUrl: string;
};
export type AuthorizeBankRequest = {
  institutionId: string;
  redirectUrl: string;
};
