export type BankSyncCredentialDto = {
  configured: boolean;
  keyHint: string | null;
};

export type SaveBankSyncCredentialRequest = {
  apiKey: string;
};

export type BankSyncAccountDto = {
  id: string;
  name: string;
  institutionName: string | null;
  institutionLogo?: string | null;
  provider?: string | null;
  currency: string | null;
  balance: string | null;
  status?: string;
  linkedAccountId: string | null;
};

export type BankSyncAccountsResponseDto = {
  accounts: BankSyncAccountDto[];
};

export type ImportBankSyncAccountsRequest = {
  accountIds: string[];
};

export type BankSyncImportResponseDto = {
  accountIds: string[];
};

export type BankSyncSyncResponseDto = {
  accountsSynced: number;
  errors: string[];
};

export type BankSyncJobAcceptedDto = {
  jobId: string;
};

export type BankSyncJobStatusDto = {
  status: 'queued' | 'running' | 'completed' | 'failed';
  result?: Record<string, unknown> | null;
  error?: string | null;
};
