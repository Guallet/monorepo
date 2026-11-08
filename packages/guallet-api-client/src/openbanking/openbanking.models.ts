export type BankProvider = 'lunchflow' | 'banksync' | 'synci' | 'nordigen';

export type BankCredentialsRequestDto = {
  apiKey?: string;
  secretId?: string;
  secretKey?: string;
};

export type BankCredentialFieldDto = {
  name: keyof BankCredentialsRequestDto;
  secret: boolean;
};

export type BankProviderDto = {
  id: BankProvider;
  name: string;
  credentialFields: BankCredentialFieldDto[];
  supportsBankAuthorization: boolean;
  supportedCountries: string[];
};

export type BankConnectionDto = {
  id: string;
  providerId: BankProvider;
  status: 'configured';
  credentialHint: string | null;
  accountsRefreshedAt: string | null;
  lastSyncedAt: string | null;
};

export type CreateBankConnectionRequestDto = {
  providerId: BankProvider;
  credentials: BankCredentialsRequestDto;
};

export type ReplaceBankCredentialsRequestDto = {
  credentials: BankCredentialsRequestDto;
};

export type ImportBankAccountsRequestDto = {
  accountIds: string[];
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

export type AuthorizeBankRequestDto = {
  institutionId: string;
  redirectUrl: string;
};
