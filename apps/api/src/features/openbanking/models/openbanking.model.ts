import type { BankConnection } from '../entities/bank-connection.entity';
import type {
  BankProvider,
  ProviderAccount,
  ProviderCredentials,
} from '../providers/bank-provider.interface';

export type BankConnectionDetails = {
  connection: BankConnection;
  credentialHint: string | null;
};

export type CreateBankConnection = {
  providerId: BankProvider;
  credentials: ProviderCredentials;
};

export type BankAccounts = {
  accounts: ProviderAccount[];
  refreshedAt: Date | null;
};

export type BankAuthorizationInput = {
  institutionId: string;
  redirectUrl: string;
};

export type BankAuthorizationResult = {
  id: string;
  action: 'redirect';
  redirectUrl: string;
};
