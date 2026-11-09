import { BankSyncService } from './banksync/banksync.service';
import { LunchFlowService } from './lunchflow/lunchflow.service';
import { NordigenService } from './nordigen/nordigen.service';
import { SynciService } from './synci/synci.service';
import type {
  BankProviderAdapter,
  BankProvider,
} from './bank-provider.interface';

function setup(provider: BankProvider) {
  const links = {
    find: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue({ affected: 1 }),
  };
  const client = {
    getAccounts: vi.fn().mockResolvedValue([]),
    getBanks: vi.fn().mockResolvedValue([]),
    getToken: vi.fn().mockResolvedValue('token'),
  };
  const adapters: Record<BankProvider, BankProviderAdapter> = {
    banksync: new BankSyncService(
      links as never,
      {} as never,
      {} as never,
      client as never,
    ),
    lunchflow: new LunchFlowService(
      links as never,
      {} as never,
      {} as never,
      client as never,
    ),
    synci: new SynciService(
      links as never,
      {} as never,
      {} as never,
      client as never,
    ),
    nordigen: new NordigenService(
      client as never,
      { find: vi.fn().mockResolvedValue([]) } as never,
      links as never,
      {} as never,
      {} as never,
    ),
  };
  return { links, adapter: adapters[provider] };
}

describe.each(['lunchflow', 'banksync', 'synci', 'nordigen'] as const)(
  '%s shared account isolation',
  (provider) => {
    const context = {
      userId: 'owner',
      connectionId: 'connection',
      credentials:
        provider === 'nordigen'
          ? { secretId: 'id', secretKey: 'key' }
          : { apiKey: 'key' },
    };
    it('scopes synchronization to the owner and provider', async () => {
      const { adapter, links } = setup(provider);
      await adapter.sync(context);
      expect(links.find).toHaveBeenCalledWith({
        where: { user_id: 'owner', provider, is_linked: true },
      });
    });
    it('unlinks only the selected provider account', async () => {
      const { adapter, links } = setup(provider);
      const accountId =
        provider === 'banksync' ? '["bank","same-id"]' : 'same-id';
      await adapter.unlinkAccount({ ...context, accountId });
      expect(links.update).toHaveBeenCalledWith(
        { user_id: 'owner', provider, remote_account_id: accountId },
        { is_linked: false },
      );
    });
    it('disconnects only this provider for the owner', async () => {
      const { adapter, links } = setup(provider);
      await adapter.disconnect(context);
      expect(links.update).toHaveBeenCalledWith(
        { user_id: 'owner', provider },
        { is_linked: false },
      );
    });
  },
);
