import type { BankProvider } from '../providers/bank-provider.interface';
import type { BankConnectionStatus } from './bank-connection-state.model';

export type AccountConnection = {
  id: string;
  providerId: BankProvider;
  remoteAccountId: string;
  lastRefresh: Date | null;
  daysRemaining: number | null;
  status: BankConnectionStatus;
};
