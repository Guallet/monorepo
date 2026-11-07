import type { BankProviderId } from '../../openbanking/providers/bank-provider.interface';
import type { BankConnectionStatus } from '../../openbanking/models/bank-connection-state.model';

export type AccountConnection = {
  id: string;
  providerId: BankProviderId;
  remoteAccountId: string;
  lastRefresh: Date | null;
  daysRemaining: number | null;
  status: BankConnectionStatus;
};
