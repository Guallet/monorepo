import type { BankProviderId } from '../../openbanking/providers/bank-provider.interface';
import type { BankConnectionStatus } from '../../openbanking/models/bank-connection-state.model';

export class AccountConnection {
  constructor(
    public readonly id: string,
    public readonly providerId: BankProviderId,
    public readonly remoteAccountId: string,
    public readonly lastRefresh: Date | null,
    public readonly daysRemaining: number | null,
    public readonly status: BankConnectionStatus,
  ) {}
}
