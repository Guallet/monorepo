import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConnectedAccount } from '../openbanking/entities/connected-account.entity';
import { BankConnection } from '../openbanking/entities/bank-connection.entity';
import { AccountsService } from './accounts.service';
import { AccountConnection } from './models/account-connection.model';
import {
  connectionStatusFromProvider,
  validDate,
} from '../openbanking/models/bank-connection-state.model';

@Injectable()
export class AccountConnectionsService {
  constructor(
    private readonly accounts: AccountsService,
    @InjectRepository(BankConnection)
    private readonly connections: Repository<BankConnection>,
    @InjectRepository(ConnectedAccount)
    private readonly connectedAccounts: Repository<ConnectedAccount>,
  ) {}

  async getConnection(
    userId: string,
    accountId: string,
  ): Promise<AccountConnection | null> {
    const account = await this.accounts.getUserAccount(userId, accountId);

    const where = {
      user_id: userId,
      guallet_account_id: accountId,
      is_linked: true,
    };
    const links = await this.connectedAccounts.find({
      where,
      order: { created_at: 'ASC', id: 'ASC' },
    });

    for (const link of links) {
      const providerId = link.provider;
      const connection = await this.connections.findOne({
        where: { user_id: userId, provider_id: providerId },
        select: {
          id: true,
          provider_id: true,
          accounts: true,
          last_error: true,
        },
      });
      if (!connection) continue;

      const lastSyncedAt = link.last_synced_at;
      const remoteAccountId = link.remote_account_id;

      const cachedAccount = connection.accounts.find(
        (account) => account.id === remoteAccountId,
      );
      const expiresAt = validDate(cachedAccount?.connectionExpiresAt);
      const now = Date.now();
      const providerStatus =
        cachedAccount?.connectionStatus ??
        connectionStatusFromProvider(cachedAccount?.status);
      const expired =
        providerStatus === 'expired' ||
        (expiresAt !== null && expiresAt.getTime() <= now);
      const hasError =
        connection.last_error != null &&
        (connection.last_error.accountIds === null ||
          connection.last_error.accountIds.includes(remoteAccountId));
      const status = expired
        ? 'expired'
        : hasError
          ? 'connectionError'
          : providerStatus;
      const daysRemaining = expired
        ? 0
        : expiresAt
          ? Math.ceil((expiresAt.getTime() - now) / 86_400_000)
          : null;
      const refreshDates = [
        validDate(cachedAccount?.lastRefresh),
        validDate(lastSyncedAt),
        validDate(link.created_at),
      ].filter((date): date is Date => date !== null);
      const lastRefresh = refreshDates.length
        ? new Date(Math.max(...refreshDates.map((date) => date.getTime())))
        : null;

      return new AccountConnection(
        connection.id,
        providerId,
        remoteAccountId,
        lastRefresh,
        daysRemaining,
        status,
      );
    }

    return null;
  }
}
