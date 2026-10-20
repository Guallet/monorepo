export type BankSyncCredentialDto = {
  configured: boolean;
  keyHint: string | null;
};

export type SaveBankSyncCredentialRequest = {
  apiKey: string;
};

export type BankSyncAccountSelection = {
  bankId: string;
  accountId: string;
};

export type BankSyncAccountDto = {
  id: string;
  bankId: string;
  name: string;
  institutionName: string;
  currency: string | null;
  balance: string | null;
  linkedAccountId: string | null;
};

export type BankSyncAccountsResponseDto = {
  accounts: BankSyncAccountDto[];
};

export type ImportBankSyncAccountsRequest = {
  accounts: BankSyncAccountSelection[];
};

export type BankSyncImportResponseDto = {
  accountIds: string[];
};

export type BankSyncSyncResponseDto = {
  accountsSynced: number;
  errors: string[];
};
