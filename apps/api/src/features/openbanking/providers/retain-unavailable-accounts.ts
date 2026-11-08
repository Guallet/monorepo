import { In, Repository } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { ConnectedAccount } from '../entities/connected-account.entity';
import type { ProviderAccount } from './bank-provider.interface';

export async function retainUnavailableAccounts(
  userId: string,
  discovered: ProviderAccount[],
  links: ConnectedAccount[],
  accounts: Repository<Account>,
): Promise<ProviderAccount[]> {
  const discoveredIds = new Set(discovered.map((account) => account.id));
  const missing = links.filter(
    (link) => link.is_linked && !discoveredIds.has(link.remote_account_id),
  );
  if (!missing.length) return discovered;
  const localAccounts = await accounts.find({
    where: {
      user_id: userId,
      id: In(missing.map((link) => link.guallet_account_id)),
    },
  });
  const localById = new Map(
    localAccounts.map((account) => [account.id, account]),
  );
  const retained: ProviderAccount[] = missing.map((link) => {
    const local = localById.get(link.guallet_account_id);
    return {
      id: link.remote_account_id,
      name: local?.name ?? 'Bank account',
      institutionName: null,
      currency: local?.currency ?? null,
      linkedAccountId: link.guallet_account_id,
      status: 'unavailable',
      connectionStatus: 'connectionError',
    };
  });
  return [...discovered, ...retained];
}
