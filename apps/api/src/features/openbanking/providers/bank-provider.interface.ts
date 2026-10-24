import { BadRequestException } from '@nestjs/common';

export const BANK_PROVIDER_IDS = [
  'lunchflow',
  'banksync',
  'synci',
  'nordigen',
] as const;
export type BankProviderId = (typeof BANK_PROVIDER_IDS)[number];
export type ProviderCredentials = {
  apiKey?: string;
  secretId?: string;
  secretKey?: string;
};
export type ProviderIdentity = {
  userId: string;
  connectionId: string;
};
export type ProviderContext = ProviderIdentity & {
  credentials: ProviderCredentials;
};
export type ProviderAccount = {
  id: string;
  name: string;
  institutionName: string | null;
  institutionLogo?: string | null;
  currency: string | null;
  balance?: string | null;
  status?: string;
  linkedAccountId: string | null;
};
export type ProviderInstitution = {
  id: string;
  name: string;
  logo: string | null;
};
export type SyncResult = { accountsSynced: number; errors: string[] };
export interface BankProviderAdapter {
  validateCredentials(context: ProviderContext): Promise<void>;
  listAccounts(context: ProviderContext): Promise<ProviderAccount[]>;
  importAccounts(
    context: ProviderContext & { accountIds: string[] },
  ): Promise<string[]>;
  sync(context: ProviderContext): Promise<SyncResult>;
  unlinkAccount(
    context: ProviderIdentity & { accountId: string },
  ): Promise<void>;
  disconnect(context: ProviderIdentity): Promise<void>;
  getInstitutions?(
    context: ProviderContext & { country: string },
  ): Promise<ProviderInstitution[]>;
  authorize?(
    context: ProviderContext & {
      institutionId: string;
      redirectUrl: string;
      reference: string;
    },
  ): Promise<{ remoteId: string; redirectUrl: string }>;
  completeAuthorization?(
    context: ProviderContext & { remoteId: string },
  ): Promise<string[]>;
}
export function requireApiKey(credentials: ProviderCredentials): string {
  if (
    !credentials.apiKey?.trim() ||
    credentials.secretId !== undefined ||
    credentials.secretKey !== undefined
  ) {
    throw new BadRequestException('This provider requires an API key');
  }
  return credentials.apiKey.trim();
}
export function requireNordigenCredentials(credentials: ProviderCredentials): {
  secretId: string;
  secretKey: string;
} {
  if (
    !credentials.secretId?.trim() ||
    !credentials.secretKey?.trim() ||
    credentials.apiKey !== undefined
  ) {
    throw new BadRequestException(
      'Nordigen requires a secret ID and secret key',
    );
  }
  return {
    secretId: credentials.secretId.trim(),
    secretKey: credentials.secretKey.trim(),
  };
}
