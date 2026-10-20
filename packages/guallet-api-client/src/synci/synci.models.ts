export type SynciCredentialDto = {
  configured: boolean;
  keyHint: string | null;
};

export type SaveSynciCredentialRequest = {
  apiKey: string;
};

export type SynciAccountDto = {
  id: string;
  name: string;
  institutionName: string | null;
  institutionLogo: string | null;
  provider: string | null;
  currency: string | null;
  status: string;
  linkedAccountId: string | null;
};

export type SynciAccountsResponseDto = {
  accounts: SynciAccountDto[];
};

export type ImportSynciAccountsRequest = {
  accountIds: string[];
};

export type SynciImportResponseDto = {
  accountIds: string[];
};

export type SynciSyncResponseDto = {
  accountsSynced: number;
  errors: string[];
};
