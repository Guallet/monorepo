export type BankProviderId = 'banksync' | 'lunchflow' | 'synci';

export type BankProviderCredentialDto = {
  configured: boolean;
  keyHint: string | null;
};

export type SaveBankProviderCredentialsRequest = {
  apiKey: string;
};

export type BankProviderAccountDto = {
  id: string;
  name: string;
  institutionName: string | null;
  institutionLogo?: string | null;
  provider?: string | null;
  currency: string | null;
  balance?: string | null;
  status?: string;
  linkedAccountId: string | null;
};

export type BankProviderAccountsResponseDto = {
  accounts: BankProviderAccountDto[];
};

export type ImportBankProviderAccountsRequest = {
  accountIds: string[];
};

export type BankProviderImportResponseDto = {
  accountIds: string[];
};

export type BankProviderSyncResponseDto = {
  accountsSynced: number;
  errors: string[];
};

export type BankProviderJobAcceptedDto = {
  jobId: string;
};

export type BankProviderJobStatusDto = {
  status: 'queued' | 'running' | 'completed' | 'failed';
  result?: Record<string, unknown> | null;
  error?: string | null;
};
