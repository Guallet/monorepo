export type LunchFlowCredentialDto = {
  configured: boolean;
  keyHint: string | null;
};

export type SaveLunchFlowCredentialRequest = {
  apiKey: string;
};

export type LunchFlowAccountDto = {
  id: string;
  name: string;
  institutionName: string | null;
  institutionLogo: string | null;
  provider: string | null;
  currency: string | null;
  status: string;
  linkedAccountId: string | null;
};

export type LunchFlowAccountsResponseDto = {
  accounts: LunchFlowAccountDto[];
};

export type ImportLunchFlowAccountsRequest = {
  accountIds: string[];
};

export type LunchFlowImportResponseDto = {
  accountIds: string[];
};

export type LunchFlowSyncResponseDto = {
  accountsSynced: number;
  errors: string[];
};
